import "server-only";

import { assessmentsService } from "@/features/assessments";
import { AppError } from "@/lib/errors";
import { db } from "@/server/db/client";
import type { Member } from "@/server/member";

import {
  countAnswers,
  findActiveInstrument,
  findInstrumentById,
  findOwnResponse,
  insertResponseIfMissing,
  loadOwnAnswers,
  loadQuestionsWithOptions,
  markSubmitted,
  upsertAnswers,
} from "./repository";
import type { SubmitSurveyInput } from "./schemas";
import type { AnswerValue, SurveyFormData, SurveyStep } from "./types";
import { type QuestionRule, assertComplete, validateAnswers } from "./validate";

type QuestionRows = Awaited<ReturnType<typeof loadQuestionsWithOptions>>;

const EXTRA_STEP_ID = "extra";

/** Satu langkah per faktor; butir tanpa faktor (profil usaha, cross-check) jadi langkah sendiri. */
function buildSteps(rows: QuestionRows): SurveyStep[] {
  const steps = new Map<string, SurveyStep>();
  for (const row of rows) {
    const id = row.dimensionId ?? EXTRA_STEP_ID;
    let step = steps.get(id);
    if (!step) {
      step = {
        id,
        title: row.dimensionName ?? "",
        description: row.dimensionDescription,
        questions: [],
      };
      steps.set(id, step);
    }
    step.questions.push({
      id: row.id,
      key: row.key,
      type: row.type,
      text: row.text,
      allowNotApplicable: row.allowNotApplicable,
      options: row.options,
    });
  }

  const extra = steps.get(EXTRA_STEP_ID);
  if (extra) {
    const isProfile = extra.questions.some((question) => question.type !== "LIKERT");
    extra.title = isProfile ? "Profil Usaha" : "Pertanyaan Tambahan";
  }
  return [...steps.values()];
}

function toRules(rows: QuestionRows): QuestionRule[] {
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    allowNotApplicable: row.allowNotApplicable,
    optionIds: row.options.map((option) => option.id),
  }));
}

type AnswerRow = Awaited<ReturnType<typeof loadOwnAnswers>>[number];

function toAnswerValue(row: AnswerRow): AnswerValue | null {
  if (row.isNotApplicable) return { kind: "na" };
  if (row.likertValue !== null) return { kind: "likert", value: row.likertValue };
  if (row.boolValue !== null) return { kind: "boolean", value: row.boolValue };
  if (row.optionId !== null) return { kind: "choice", optionId: row.optionId };
  return null;
}

export const surveyService = {
  async getForm(member: Member, assessmentId: string): Promise<SurveyFormData> {
    const assessment = await assessmentsService.getForMember(member, assessmentId);
    const response = await findOwnResponse(assessment.id, member.userId);
    const instrument = response
      ? await findInstrumentById(response.instrumentId)
      : await findActiveInstrument(member.role);
    if (!instrument) throw new AppError("NOT_FOUND", "Kuesioner belum tersedia.");

    const rows = await loadQuestionsWithOptions(instrument.id);
    const answers: Record<string, AnswerValue> = {};
    if (response) {
      for (const row of await loadOwnAnswers(response.id)) {
        const value = toAnswerValue(row);
        if (value) answers[row.questionId] = value;
      }
    }

    return {
      assessmentId: assessment.id,
      assessmentLabel: assessment.label,
      assessmentStatus: assessment.status,
      role: member.role,
      responseStatus: response?.status ?? "NONE",
      steps: buildSteps(rows),
      answers,
    };
  },

  async getMyStatus(member: Member, assessmentId: string) {
    const response = await findOwnResponse(assessmentId, member.userId);
    return response?.status ?? "NONE";
  },

  /** Simpan draf (`final: false`) atau kirim final (`final: true`). */
  async save(member: Member, input: SubmitSurveyInput) {
    const assessment = await assessmentsService.getForMember(member, input.assessmentId);
    if (assessment.status !== "OPEN") {
      throw new AppError("RULE_VIOLATION", "Periode penilaian ini sudah ditutup.");
    }

    let response = await findOwnResponse(assessment.id, member.userId);
    if (!response) {
      const active = await findActiveInstrument(member.role);
      if (!active) throw new AppError("NOT_FOUND", "Kuesioner belum tersedia.");
      await insertResponseIfMissing(db, {
        assessmentId: assessment.id,
        instrumentId: active.id,
        userId: member.userId,
      });
      response = await findOwnResponse(assessment.id, member.userId);
    }
    if (!response) throw new Error("Gagal membuat respons");
    if (response.status === "SUBMITTED") {
      throw new AppError("RULE_VIOLATION", "Jawaban sudah dikirim final dan tidak bisa diubah.");
    }

    const instrument = await findInstrumentById(response.instrumentId);
    if (instrument?.targetRole !== member.role) {
      throw new AppError("FORBIDDEN", "Kuesioner ini bukan untuk peran Anda.");
    }

    const rules = toRules(await loadQuestionsWithOptions(response.instrumentId));
    validateAnswers(rules, input.answers);

    const responseId = response.id;
    await db.transaction(async (tx) => {
      await upsertAnswers(tx, responseId, input.answers);
      if (!input.final) return;
      assertComplete(rules, await countAnswers(tx, responseId));
      if (!(await markSubmitted(tx, responseId))) {
        throw new AppError("CONFLICT", "Jawaban sudah dikirim final.");
      }
    });
  },
};
