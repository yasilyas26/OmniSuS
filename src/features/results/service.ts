import "server-only";

import { describeGap } from "@/domain/scoring";
import { env } from "@/env";
import { AppError } from "@/lib/errors";
import type { Member } from "@/server/member";

import {
  findResultForBusiness,
  listCrossChecks,
  listDimensionResults,
  listHistoryForBusiness,
} from "./repository";
import type { ResultsView } from "./types";

const toNumber = (value: string | null) => (value === null ? null : Number(value));

export const resultsService = {
  /**
   * Hasil lengkap satu periode untuk owner, seluruhnya dari snapshot. Tidak pernah membaca
   * tabel `answers`, sehingga jawaban individual karyawan mustahil bocor lewat jalur ini.
   * Mengembalikan null jika periode bukan milik UMKM ini atau belum ditutup.
   */
  async getForOwner(member: Member, assessmentId: string): Promise<ResultsView | null> {
    if (member.role !== "OWNER") {
      throw new AppError("FORBIDDEN", "Hanya pemilik yang dapat melihat hasil.");
    }
    const result = await findResultForBusiness(assessmentId, member.businessId);
    if (!result) return null;

    const [dimensionRows, crossCheckRows, history] = await Promise.all([
      listDimensionResults(assessmentId),
      listCrossChecks(assessmentId),
      listHistoryForBusiness(member.businessId),
    ]);

    const dimensions = dimensionRows.map((row) => {
      const gap = toNumber(row.gap);
      return {
        dimensionId: row.dimensionId,
        name: row.name,
        isShared: row.isShared,
        ownerScore: toNumber(row.ownerScore),
        employeeScore: toNumber(row.employeeScore),
        gap,
        interpretation: gap === null ? null : describeGap(row.name, gap),
      };
    });

    return {
      assessment: {
        id: result.id,
        label: result.label,
        openedAt: result.openedAt,
        closedAt: result.closedAt,
      },
      summary: {
        ownerScore: Number(result.ownerScore),
        employeeScore: toNumber(result.employeeScore),
        combinedScore: Number(result.combinedScore),
        category: result.category,
        employeeRespondents: result.employeeRespondents,
      },
      employeeDataHidden: result.employeeScore === null,
      minEmployeeResponses: env.MIN_EMPLOYEE_RESPONSES,
      dimensions,
      // Gap terbesar (nilai mutlak) lebih dulu: temuan yang paling layak dibaca owner.
      gaps: dimensions
        .filter((dimension) => dimension.gap !== null)
        .sort((a, b) => Math.abs(b.gap ?? 0) - Math.abs(a.gap ?? 0)),
      crossChecks: crossCheckRows.map((row) => ({
        pairKey: row.pairKey,
        statement: row.statement,
        ownerValue: row.ownerValue,
        employeeMean: toNumber(row.employeeMean),
      })),
      history: history.map((row) => ({
        id: row.id,
        label: row.label,
        closedAt: row.closedAt,
        ownerScore: Number(row.ownerScore),
        employeeScore: toNumber(row.employeeScore),
        combinedScore: Number(row.combinedScore),
      })),
    };
  },
};
