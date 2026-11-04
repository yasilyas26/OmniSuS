import "server-only";

import {
  type AnswerDef,
  type QuestionDef,
  SCORING_VERSION,
  computeAssessmentResult,
} from "@/domain/scoring";
import { env } from "@/env";
import { isUniqueViolation } from "@/lib/db-errors";
import { AppError } from "@/lib/errors";
import { db } from "@/server/db/client";
import type { Member } from "@/server/member";

import {
  countActiveEmployees,
  countSubmittedByRole,
  findAssessmentForBusiness,
  findOpenAssessmentForBusiness,
  insertAssessment,
  insertSnapshot,
  listAssessmentsForBusiness,
  loadScoringData,
  markClosed,
} from "./repository";
import type { CloseAssessmentInput, OpenAssessmentInput } from "./schemas";

function assertOwner(member: Member) {
  if (member.role !== "OWNER") {
    throw new AppError("FORBIDDEN", "Hanya pemilik yang dapat mengelola periode penilaian.");
  }
}

type QuestionRow = Awaited<ReturnType<typeof loadScoringData>>["questionRows"][number];

function toQuestionDef(row: QuestionRow): QuestionDef {
  return {
    id: row.id,
    type: row.type,
    dimensionId: row.dimensionId,
    polarity: row.polarity,
    weight: Number(row.weight),
    pairKey: row.pairKey,
  };
}

export const assessmentsService = {
  async list(member: Member) {
    assertOwner(member);
    return listAssessmentsForBusiness(member.businessId);
  },

  /** Periode yang terbuka untuk UMKM si pengguna (pemilik maupun karyawan). */
  async getOpen(member: Member) {
    return findOpenAssessmentForBusiness(member.businessId);
  },

  /** Satu-satunya jalan masuk ke assessment tenant: selalu di-scope `businessId` dari sesi. */
  async getForMember(member: Member, assessmentId: string) {
    const assessment = await findAssessmentForBusiness(assessmentId, member.businessId);
    if (!assessment) throw new AppError("NOT_FOUND", "Periode penilaian tidak ditemukan.");
    return assessment;
  },

  async open(member: Member, input: OpenAssessmentInput) {
    assertOwner(member);
    if (await findOpenAssessmentForBusiness(member.businessId)) {
      throw new AppError(
        "CONFLICT",
        "Masih ada periode yang terbuka. Tutup dulu sebelum membuka yang baru.",
      );
    }
    try {
      const assessment = await insertAssessment(member.businessId, input.label);
      return { assessmentId: assessment.id };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppError("CONFLICT", "Masih ada periode yang terbuka.");
      }
      throw error;
    }
  },

  /** Hanya angka agregat; tidak ada info siapa yang sudah mengisi. */
  async getProgress(member: Member, assessmentId: string) {
    assertOwner(member);
    await this.getForMember(member, assessmentId);
    const [submitted, activeEmployeeCount] = await Promise.all([
      countSubmittedByRole(assessmentId),
      countActiveEmployees(member.businessId),
    ]);
    return {
      ownerSubmitted: submitted.owner > 0,
      employeeSubmittedCount: submitted.employee,
      activeEmployeeCount,
      minEmployeeResponses: env.MIN_EMPLOYEE_RESPONSES,
    };
  },

  /** Pemilik dan seluruh karyawan aktif sudah kirim final. Tanpa karyawan aktif dianggap belum. */
  async isFullySubmitted(businessId: string, assessmentId: string) {
    const [submitted, activeEmployeeCount] = await Promise.all([
      countSubmittedByRole(assessmentId),
      countActiveEmployees(businessId),
    ]);
    return (
      submitted.owner > 0 && activeEmployeeCount > 0 && submitted.employee >= activeEmployeeCount
    );
  },

  /** Aturan PRD §7.4. Skor dihitung lalu disimpan sebagai snapshot dalam satu transaksi. */
  async close(member: Member, input: CloseAssessmentInput) {
    assertOwner(member);
    const assessment = await this.getForMember(member, input.assessmentId);
    if (assessment.status !== "OPEN") throw new AppError("CONFLICT", "Periode ini sudah ditutup.");

    const submitted = await countSubmittedByRole(assessment.id);
    if (submitted.owner === 0) {
      throw new AppError("RULE_VIOLATION", "Kuesioner pemilik belum dikirim final.");
    }
    if (submitted.employee < env.MIN_EMPLOYEE_RESPONSES && !input.allowWithoutEmployees) {
      throw new AppError(
        "RULE_VIOLATION",
        `Baru ${submitted.employee} karyawan yang mengirim final (minimal ${env.MIN_EMPLOYEE_RESPONSES}). ` +
          "Tunggu lebih banyak karyawan, atau pilih tutup tanpa data karyawan.",
      );
    }

    const data = await loadScoringData(assessment.id);
    const ownerResponse = data.submitted.find((row) => row.role === "OWNER");
    if (!ownerResponse)
      throw new AppError("RULE_VIOLATION", "Kuesioner pemilik belum dikirim final.");
    const employeeResponses = data.submitted.filter((row) => row.role === "EMPLOYEE");

    const answersByResponse = new Map<string, AnswerDef[]>();
    for (const row of data.answerRows) {
      const list = answersByResponse.get(row.responseId) ?? [];
      list.push({
        questionId: row.questionId,
        likertValue: row.likertValue,
        isNotApplicable: row.isNotApplicable,
      });
      answersByResponse.set(row.responseId, list);
    }

    const ownerQuestionRows = data.questionRows.filter(
      (row) => row.instrumentId === ownerResponse.instrumentId,
    );
    // Karyawan bisa saja mengisi dengan versi instrumen berbeda (admin mengaktifkan versi baru di tengah
    // periode). Butir gabungan semua versi dipakai; butir yang tidak dijawab seorang responden otomatis
    // dikeluarkan dari skornya, jadi tidak ada versi yang terhitung salah.
    const employeeInstrumentIds = new Set(employeeResponses.map((row) => row.instrumentId));
    const employeeQuestionRows = data.questionRows.filter((row) =>
      employeeInstrumentIds.has(row.instrumentId),
    );

    const weightByDimension = new Map(
      data.weightRows
        .filter((row) => row.instrumentId === ownerResponse.instrumentId)
        .map((row) => [row.dimensionId, Number(row.weight)]),
    );

    const result = computeAssessmentResult({
      dimensions: data.dimensionRows.map((row) => ({
        id: row.id,
        isShared: row.isShared,
        weight: weightByDimension.get(row.id) ?? 1,
      })),
      ownerQuestions: ownerQuestionRows.map(toQuestionDef),
      employeeQuestions: employeeQuestionRows.map(toQuestionDef),
      ownerAnswers: answersByResponse.get(ownerResponse.responseId) ?? [],
      employeeAnswers: employeeResponses.map((row) => answersByResponse.get(row.responseId) ?? []),
      scale: { min: ownerResponse.scaleMin, max: ownerResponse.scaleMax },
      minEmployeeResponses: env.MIN_EMPLOYEE_RESPONSES,
      ownerWeight: env.OWNER_WEIGHT,
    });

    const statements = new Map(
      ownerQuestionRows.flatMap((row) => (row.pairKey ? [[row.pairKey, row.text] as const] : [])),
    );

    await db.transaction(async (tx) => {
      const closed = await markClosed(tx, assessment.id, member.businessId);
      if (!closed) throw new AppError("CONFLICT", "Periode ini sudah ditutup.");
      await insertSnapshot(tx, assessment.id, result, SCORING_VERSION, statements);
    });
  },
};
