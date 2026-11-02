import { and, asc, desc, eq, inArray, max, sql } from "drizzle-orm";
import "server-only";

import { type DbOrTx, db } from "@/server/db/client";
import {
  dimensionWeights,
  dimensions,
  instruments,
  questionOptions,
  questions,
  responses,
} from "@/server/db/schema";

type Role = "OWNER" | "EMPLOYEE";

export async function listInstrumentsWithStats() {
  return db
    .select({
      id: instruments.id,
      code: instruments.code,
      targetRole: instruments.targetRole,
      version: instruments.version,
      isActive: instruments.isActive,
      questionCount: sql<number>`(select count(*)::int from ${questions} where ${questions.instrumentId} = ${instruments.id})`,
      responseCount: sql<number>`(select count(*)::int from ${responses} where ${responses.instrumentId} = ${instruments.id})`,
    })
    .from(instruments)
    .orderBy(asc(instruments.targetRole), desc(instruments.version));
}

export async function findInstrument(instrumentId: string) {
  const [row] = await db.select().from(instruments).where(eq(instruments.id, instrumentId));
  return row;
}

export async function countResponses(instrumentId: string) {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(responses)
    .where(eq(responses.instrumentId, instrumentId));
  return row?.total ?? 0;
}

export async function listQuestionsDetailed(instrumentId: string) {
  const rows = await db
    .select({
      id: questions.id,
      key: questions.key,
      type: questions.type,
      text: questions.text,
      dimensionId: questions.dimensionId,
      dimensionName: dimensions.name,
      polarity: questions.polarity,
      allowNotApplicable: questions.allowNotApplicable,
      pairKey: questions.pairKey,
      weight: questions.weight,
      sortOrder: questions.sortOrder,
    })
    .from(questions)
    .leftJoin(dimensions, eq(dimensions.id, questions.dimensionId))
    .where(eq(questions.instrumentId, instrumentId))
    .orderBy(asc(questions.sortOrder));

  const ids = rows.map((row) => row.id);
  const options = ids.length
    ? await db
        .select()
        .from(questionOptions)
        .where(inArray(questionOptions.questionId, ids))
        .orderBy(asc(questionOptions.sortOrder))
    : [];

  return rows.map((row) => ({
    ...row,
    options: options.filter((option) => option.questionId === row.id).map((o) => o.label),
  }));
}

export async function listDimensions() {
  return db.select().from(dimensions).orderBy(asc(dimensions.sortOrder));
}

export async function findQuestion(instrumentId: string, questionId: string) {
  const [row] = await db
    .select()
    .from(questions)
    .where(and(eq(questions.id, questionId), eq(questions.instrumentId, instrumentId)));
  return row;
}

export async function maxVersionForRole(role: Role) {
  const [row] = await db
    .select({ version: max(instruments.version) })
    .from(instruments)
    .where(eq(instruments.targetRole, role));
  return row?.version ?? 0;
}

/** Versi non-aktif milik satu peran beserta jumlah respons; dipakai mendeteksi draf yang masih ada. */
export async function listInactiveWithResponses(role: Role) {
  return db
    .select({
      id: instruments.id,
      code: instruments.code,
      responseCount: sql<number>`(select count(*)::int from ${responses} where ${responses.instrumentId} = ${instruments.id})`,
    })
    .from(instruments)
    .where(and(eq(instruments.targetRole, role), eq(instruments.isActive, false)));
}

/** Menyalin instrumen beserta butir, opsi, dan bobot faktornya menjadi versi baru (non-aktif). */
export async function cloneInstrument(
  exec: DbOrTx,
  source: typeof instruments.$inferSelect,
  next: { code: string; version: number },
) {
  const [created] = await exec
    .insert(instruments)
    .values({
      code: next.code,
      targetRole: source.targetRole,
      version: next.version,
      scaleMin: source.scaleMin,
      scaleMax: source.scaleMax,
      isActive: false,
    })
    .returning({ id: instruments.id });
  if (!created) throw new Error("Gagal membuat versi baru");

  const sourceQuestions = await exec
    .select()
    .from(questions)
    .where(eq(questions.instrumentId, source.id));

  if (sourceQuestions.length > 0) {
    const copies = await exec
      .insert(questions)
      .values(
        sourceQuestions.map((q) => ({
          instrumentId: created.id,
          key: q.key,
          type: q.type,
          dimensionId: q.dimensionId,
          text: q.text,
          polarity: q.polarity,
          allowNotApplicable: q.allowNotApplicable,
          pairKey: q.pairKey,
          weight: q.weight,
          sortOrder: q.sortOrder,
        })),
      )
      .returning({ id: questions.id, key: questions.key });
    const newIdByKey = new Map(copies.map((row) => [row.key, row.id]));

    const sourceOptions = await exec
      .select()
      .from(questionOptions)
      .where(
        inArray(
          questionOptions.questionId,
          sourceQuestions.map((q) => q.id),
        ),
      );
    const keyBySourceId = new Map(sourceQuestions.map((q) => [q.id, q.key]));
    const optionCopies = sourceOptions.flatMap((option) => {
      const newId = newIdByKey.get(keyBySourceId.get(option.questionId) ?? "");
      return newId ? [{ questionId: newId, label: option.label, sortOrder: option.sortOrder }] : [];
    });
    if (optionCopies.length > 0) await exec.insert(questionOptions).values(optionCopies);
  }

  const weights = await exec
    .select()
    .from(dimensionWeights)
    .where(eq(dimensionWeights.instrumentId, source.id));
  if (weights.length > 0) {
    await exec
      .insert(dimensionWeights)
      .values(weights.map((w) => ({ ...w, instrumentId: created.id })));
  }
  return created.id;
}

type QuestionValues = {
  key: string;
  type: "LIKERT" | "BOOLEAN" | "CHOICE";
  text: string;
  dimensionId: string | null;
  polarity: "POSITIVE" | "NEGATIVE" | null;
  allowNotApplicable: boolean;
  pairKey: string | null;
  weight: number;
};

export async function insertQuestion(exec: DbOrTx, instrumentId: string, values: QuestionValues) {
  const [last] = await exec
    .select({ top: max(questions.sortOrder) })
    .from(questions)
    .where(eq(questions.instrumentId, instrumentId));
  const [row] = await exec
    .insert(questions)
    .values({
      ...values,
      weight: String(values.weight),
      instrumentId,
      sortOrder: (last?.top ?? 0) + 1,
    })
    .returning({ id: questions.id });
  if (!row) throw new Error("Gagal menyimpan butir");
  return row.id;
}

export async function updateQuestion(exec: DbOrTx, questionId: string, values: QuestionValues) {
  await exec
    .update(questions)
    .set({ ...values, weight: String(values.weight) })
    .where(eq(questions.id, questionId));
}

export async function replaceOptions(exec: DbOrTx, questionId: string, labels: string[]) {
  await exec.delete(questionOptions).where(eq(questionOptions.questionId, questionId));
  if (labels.length > 0) {
    await exec
      .insert(questionOptions)
      .values(labels.map((label, index) => ({ questionId, label, sortOrder: index + 1 })));
  }
}

export async function deleteQuestionById(questionId: string) {
  await db.delete(questions).where(eq(questions.id, questionId));
}

export async function swapSortOrder(
  exec: DbOrTx,
  a: { id: string; sortOrder: number },
  b: { id: string; sortOrder: number },
) {
  await exec.update(questions).set({ sortOrder: b.sortOrder }).where(eq(questions.id, a.id));
  await exec.update(questions).set({ sortOrder: a.sortOrder }).where(eq(questions.id, b.id));
}

/** Satu versi aktif per peran (dijaga juga oleh indeks unik parsial). */
export async function activateInstrument(exec: DbOrTx, instrumentId: string, role: Role) {
  await exec
    .update(instruments)
    .set({ isActive: false })
    .where(and(eq(instruments.targetRole, role), eq(instruments.isActive, true)));
  await exec.update(instruments).set({ isActive: true }).where(eq(instruments.id, instrumentId));
}

export async function deleteInstrumentById(instrumentId: string) {
  await db.delete(instruments).where(eq(instruments.id, instrumentId));
}

export async function updateDimensionById(
  dimensionId: string,
  values: {
    name: string;
    description: string;
    nameEn: string | null;
    descriptionEn: string | null;
  },
) {
  await db.update(dimensions).set(values).where(eq(dimensions.id, dimensionId));
}
