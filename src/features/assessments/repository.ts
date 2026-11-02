import { and, count, desc, eq, inArray } from "drizzle-orm";
import "server-only";

import type { AssessmentResultValue } from "@/domain/scoring";
import { type DbOrTx, db } from "@/server/db/client";
import {
  answers,
  assessmentResults,
  assessments,
  crossCheckResults,
  dimensionResults,
  dimensionWeights,
  dimensions,
  instruments,
  memberships,
  questions,
  responses,
} from "@/server/db/schema";

export async function insertAssessment(businessId: string, label: string) {
  const [row] = await db.insert(assessments).values({ businessId, label }).returning();
  if (!row) throw new Error("Gagal membuka periode");
  return row;
}

export async function findAssessmentForBusiness(id: string, businessId: string) {
  const [row] = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.id, id), eq(assessments.businessId, businessId)));
  return row;
}

export async function findOpenAssessmentForBusiness(businessId: string) {
  const [row] = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.businessId, businessId), eq(assessments.status, "OPEN")));
  return row;
}

export async function listAssessmentsForBusiness(businessId: string) {
  return db
    .select({
      id: assessments.id,
      label: assessments.label,
      status: assessments.status,
      openedAt: assessments.openedAt,
      closedAt: assessments.closedAt,
      category: assessmentResults.category,
      combinedScore: assessmentResults.combinedScore,
    })
    .from(assessments)
    .leftJoin(assessmentResults, eq(assessmentResults.assessmentId, assessments.id))
    .where(eq(assessments.businessId, businessId))
    .orderBy(desc(assessments.openedAt));
}

/** Hanya jumlah, tidak pernah identitas siapa yang sudah submit. */
export async function countSubmittedByRole(assessmentId: string) {
  const rows = await db
    .select({ role: instruments.targetRole, total: count() })
    .from(responses)
    .innerJoin(instruments, eq(instruments.id, responses.instrumentId))
    .where(and(eq(responses.assessmentId, assessmentId), eq(responses.status, "SUBMITTED")))
    .groupBy(instruments.targetRole);
  const byRole = new Map(rows.map((row) => [row.role, row.total]));
  return { owner: byRole.get("OWNER") ?? 0, employee: byRole.get("EMPLOYEE") ?? 0 };
}

export async function countActiveEmployees(businessId: string) {
  const [row] = await db
    .select({ total: count() })
    .from(memberships)
    .where(
      and(
        eq(memberships.businessId, businessId),
        eq(memberships.role, "EMPLOYEE"),
        eq(memberships.status, "ACTIVE"),
      ),
    );
  return row?.total ?? 0;
}

/** Bahan mentah untuk skoring: dibaca di server hanya untuk dihitung, tidak pernah dikirim ke UI. */
export async function loadScoringData(assessmentId: string) {
  const submitted = await db
    .select({
      responseId: responses.id,
      instrumentId: responses.instrumentId,
      role: instruments.targetRole,
      scaleMin: instruments.scaleMin,
      scaleMax: instruments.scaleMax,
    })
    .from(responses)
    .innerJoin(instruments, eq(instruments.id, responses.instrumentId))
    .where(and(eq(responses.assessmentId, assessmentId), eq(responses.status, "SUBMITTED")));

  const instrumentIds = [...new Set(submitted.map((row) => row.instrumentId))];
  const responseIds = submitted.map((row) => row.responseId);

  const [questionRows, answerRows, dimensionRows, weightRows] = await Promise.all([
    instrumentIds.length
      ? db.select().from(questions).where(inArray(questions.instrumentId, instrumentIds))
      : [],
    responseIds.length
      ? db
          .select({
            responseId: answers.responseId,
            questionId: answers.questionId,
            likertValue: answers.likertValue,
            isNotApplicable: answers.isNotApplicable,
          })
          .from(answers)
          .where(inArray(answers.responseId, responseIds))
      : [],
    db.select({ id: dimensions.id, isShared: dimensions.isShared }).from(dimensions),
    instrumentIds.length
      ? db
          .select()
          .from(dimensionWeights)
          .where(inArray(dimensionWeights.instrumentId, instrumentIds))
      : [],
  ]);

  return { submitted, questionRows, answerRows, dimensionRows, weightRows };
}

/** Mengunci periode; false jika sudah tidak OPEN (mis. ditutup bersamaan). */
export async function markClosed(exec: DbOrTx, assessmentId: string, businessId: string) {
  const rows = await exec
    .update(assessments)
    .set({ status: "CLOSED", closedAt: new Date() })
    .where(
      and(
        eq(assessments.id, assessmentId),
        eq(assessments.businessId, businessId),
        eq(assessments.status, "OPEN"),
      ),
    )
    .returning({ id: assessments.id });
  return rows.length > 0;
}

const toNumeric = (value: number | null) => (value === null ? null : value.toFixed(2));

export async function insertSnapshot(
  exec: DbOrTx,
  assessmentId: string,
  result: AssessmentResultValue,
  scoringVersion: string,
  statements: ReadonlyMap<string, string>,
) {
  await exec.insert(assessmentResults).values({
    assessmentId,
    ownerScore: result.ownerScore.toFixed(2),
    employeeScore: toNumeric(result.employeeScore),
    employeeRespondents: result.employeeRespondents,
    combinedScore: result.combinedScore.toFixed(2),
    category: result.category,
    scoringVersion,
  });

  await exec.insert(dimensionResults).values(
    result.dimensions.map((dimension) => ({
      assessmentId,
      dimensionId: dimension.dimensionId,
      ownerScore: toNumeric(dimension.ownerScore),
      employeeScore: toNumeric(dimension.employeeScore),
      gap: toNumeric(dimension.gap),
    })),
  );

  if (result.crossChecks.length > 0) {
    await exec.insert(crossCheckResults).values(
      result.crossChecks.map((check) => ({
        assessmentId,
        pairKey: check.pairKey,
        statement: statements.get(check.pairKey) ?? check.pairKey,
        ownerValue: check.ownerValue,
        employeeMean: toNumeric(check.employeeMean),
      })),
    );
  }
}
