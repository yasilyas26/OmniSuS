import { and, asc, eq, inArray, sql } from "drizzle-orm";
import "server-only";

import { type DbOrTx, db } from "@/server/db/client";
import {
  answers,
  businesses,
  dimensions,
  instruments,
  memberships,
  questionOptions,
  questions,
  responses,
  user,
} from "@/server/db/schema";

import type { AnswerEntry } from "./types";

/** Kontak untuk email notifikasi; hanya nama dan email, tidak ada jawaban. */
export async function findUserContact(userId: string) {
  const [row] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return row ?? null;
}

export async function findOwnerContact(businessId: string) {
  const [row] = await db
    .select({ email: user.email, name: user.name, businessName: businesses.name })
    .from(memberships)
    .innerJoin(user, eq(user.id, memberships.userId))
    .innerJoin(businesses, eq(businesses.id, memberships.businessId))
    .where(
      and(
        eq(memberships.businessId, businessId),
        eq(memberships.role, "OWNER"),
        eq(memberships.status, "ACTIVE"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function findActiveInstrument(role: "OWNER" | "EMPLOYEE") {
  const [row] = await db
    .select()
    .from(instruments)
    .where(and(eq(instruments.targetRole, role), eq(instruments.isActive, true)));
  return row;
}

export async function findInstrumentById(instrumentId: string) {
  const [row] = await db.select().from(instruments).where(eq(instruments.id, instrumentId));
  return row;
}

export async function loadQuestionsWithOptions(instrumentId: string) {
  const rows = await db
    .select({
      id: questions.id,
      key: questions.key,
      type: questions.type,
      text: questions.text,
      allowNotApplicable: questions.allowNotApplicable,
      sortOrder: questions.sortOrder,
      dimensionId: questions.dimensionId,
      dimensionName: dimensions.name,
      dimensionDescription: dimensions.description,
    })
    .from(questions)
    .leftJoin(dimensions, eq(dimensions.id, questions.dimensionId))
    .where(eq(questions.instrumentId, instrumentId))
    .orderBy(asc(questions.sortOrder));

  const questionIds = rows.map((row) => row.id);
  const optionRows = questionIds.length
    ? await db
        .select()
        .from(questionOptions)
        .where(inArray(questionOptions.questionId, questionIds))
        .orderBy(asc(questionOptions.sortOrder))
    : [];

  return rows.map((row) => ({
    ...row,
    options: optionRows
      .filter((option) => option.questionId === row.id)
      .map((option) => ({ id: option.id, label: option.label })),
  }));
}

/** Respons milik pengguna sendiri; tidak ada fungsi untuk membaca respons orang lain. */
export async function findOwnResponse(assessmentId: string, userId: string) {
  const [row] = await db
    .select()
    .from(responses)
    .where(and(eq(responses.assessmentId, assessmentId), eq(responses.userId, userId)));
  return row;
}

export async function insertResponseIfMissing(
  exec: DbOrTx,
  values: { assessmentId: string; instrumentId: string; userId: string },
) {
  await exec.insert(responses).values(values).onConflictDoNothing();
}

export async function loadOwnAnswers(responseId: string) {
  return db.select().from(answers).where(eq(answers.responseId, responseId));
}

export async function upsertAnswers(
  exec: DbOrTx,
  responseId: string,
  entries: readonly AnswerEntry[],
) {
  if (entries.length === 0) return;
  await exec
    .insert(answers)
    .values(
      entries.map((entry) => ({
        responseId,
        questionId: entry.questionId,
        likertValue: entry.kind === "likert" ? entry.value : null,
        boolValue: entry.kind === "boolean" ? entry.value : null,
        optionId: entry.kind === "choice" ? entry.optionId : null,
        isNotApplicable: entry.kind === "na",
      })),
    )
    .onConflictDoUpdate({
      target: [answers.responseId, answers.questionId],
      set: {
        likertValue: sqlExcluded("likert_value"),
        boolValue: sqlExcluded("bool_value"),
        optionId: sqlExcluded("option_id"),
        isNotApplicable: sqlExcluded("is_not_applicable"),
      },
    });
}

export async function countAnswers(exec: DbOrTx, responseId: string) {
  const rows = await exec
    .select({ questionId: answers.questionId })
    .from(answers)
    .where(eq(answers.responseId, responseId));
  return new Set(rows.map((row) => row.questionId));
}

export async function markSubmitted(exec: DbOrTx, responseId: string) {
  const rows = await exec
    .update(responses)
    .set({ status: "SUBMITTED", submittedAt: new Date() })
    .where(and(eq(responses.id, responseId), eq(responses.status, "DRAFT")))
    .returning({ id: responses.id });
  return rows.length > 0;
}

function sqlExcluded(column: string) {
  return sql.raw(`excluded.${column}`);
}
