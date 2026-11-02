import { and, asc, eq } from "drizzle-orm";
import "server-only";

import { db } from "@/server/db/client";
import {
  assessmentResults,
  assessments,
  crossCheckResults,
  dimensionResults,
  dimensions,
} from "@/server/db/schema";

/** Snapshot hasil satu periode TERTUTUP milik UMKM ini; undefined jika bukan miliknya atau belum ditutup. */
export async function findResultForBusiness(assessmentId: string, businessId: string) {
  const [row] = await db
    .select({
      id: assessments.id,
      label: assessments.label,
      openedAt: assessments.openedAt,
      closedAt: assessments.closedAt,
      ownerScore: assessmentResults.ownerScore,
      employeeScore: assessmentResults.employeeScore,
      employeeRespondents: assessmentResults.employeeRespondents,
      combinedScore: assessmentResults.combinedScore,
      category: assessmentResults.category,
    })
    .from(assessments)
    .innerJoin(assessmentResults, eq(assessmentResults.assessmentId, assessments.id))
    .where(and(eq(assessments.id, assessmentId), eq(assessments.businessId, businessId)));
  return row;
}

export async function listDimensionResults(assessmentId: string) {
  return db
    .select({
      dimensionId: dimensions.id,
      name: dimensions.name,
      isShared: dimensions.isShared,
      ownerScore: dimensionResults.ownerScore,
      employeeScore: dimensionResults.employeeScore,
      gap: dimensionResults.gap,
    })
    .from(dimensionResults)
    .innerJoin(dimensions, eq(dimensions.id, dimensionResults.dimensionId))
    .where(eq(dimensionResults.assessmentId, assessmentId))
    .orderBy(asc(dimensions.sortOrder));
}

export async function listCrossChecks(assessmentId: string) {
  return db
    .select()
    .from(crossCheckResults)
    .where(eq(crossCheckResults.assessmentId, assessmentId));
}

/** Tren antarperiode: hanya periode tertutup milik UMKM ini, dari yang paling lama. */
export async function listHistoryForBusiness(businessId: string) {
  return db
    .select({
      id: assessments.id,
      label: assessments.label,
      closedAt: assessments.closedAt,
      ownerScore: assessmentResults.ownerScore,
      employeeScore: assessmentResults.employeeScore,
      combinedScore: assessmentResults.combinedScore,
    })
    .from(assessments)
    .innerJoin(assessmentResults, eq(assessmentResults.assessmentId, assessments.id))
    .where(and(eq(assessments.businessId, businessId), eq(assessments.status, "CLOSED")))
    .orderBy(asc(assessments.closedAt));
}
