import "server-only";

import { isUniqueViolation } from "@/lib/db-errors";
import { AppError } from "@/lib/errors";
import { db } from "@/server/db/client";

import { findActivationIssues } from "./activation";
import {
  activateInstrument,
  cloneInstrument,
  countResponses,
  deleteInstrumentById,
  deleteQuestionById,
  findInstrument,
  findQuestion,
  insertQuestion,
  listDimensions,
  listInactiveWithResponses,
  listInstrumentsWithStats,
  listQuestionsDetailed,
  maxVersionForRole,
  replaceOptions,
  swapSortOrder,
  updateDimensionById,
  updateQuestion,
} from "./repository";
import type { DimensionFormInput, QuestionFormInput } from "./schemas";

const LOCKED_MESSAGE =
  "Versi ini sudah aktif atau sudah pernah dijawab, jadi tidak bisa diubah. Buat versi baru dari versi ini.";

/** Semua method di sini hanya boleh dipanggil dari action yang sudah memeriksa `requireAdmin()`. */
async function loadEditable(instrumentId: string) {
  const instrument = await findInstrument(instrumentId);
  if (!instrument) throw new AppError("NOT_FOUND", "Instrumen tidak ditemukan.");
  const responseCount = await countResponses(instrumentId);
  const editable = !instrument.isActive && responseCount === 0;
  return { instrument, responseCount, editable };
}

async function assertEditable(instrumentId: string) {
  const loaded = await loadEditable(instrumentId);
  if (!loaded.editable) throw new AppError("RULE_VIOLATION", LOCKED_MESSAGE);
  return loaded.instrument;
}

function toQuestionValues(input: QuestionFormInput) {
  return {
    key: input.key,
    type: input.type,
    text: input.text,
    dimensionId: input.dimensionId,
    polarity: input.polarity,
    allowNotApplicable: input.allowNotApplicable,
    pairKey: input.pairKey ? input.pairKey : null,
    weight: input.weight,
  };
}

export const instrumentsService = {
  list: listInstrumentsWithStats,

  async getEditor(instrumentId: string) {
    const { instrument, responseCount, editable } = await loadEditable(instrumentId);
    const [questions, dimensions] = await Promise.all([
      listQuestionsDetailed(instrumentId),
      listDimensions(),
    ]);
    return {
      instrument,
      responseCount,
      editable,
      questions,
      dimensions: dimensions.map((d) => ({ id: d.id, name: d.name })),
      activationIssues: findActivationIssues(
        questions.map((q) => ({
          key: q.key,
          type: q.type,
          dimensionId: q.dimensionId,
          optionCount: q.options.length,
        })),
      ),
    };
  },

  /** Membuat versi draf dari versi yang ada. Hanya satu draf yang boleh ada per peran. */
  async createDraft(sourceInstrumentId: string) {
    const source = await findInstrument(sourceInstrumentId);
    if (!source) throw new AppError("NOT_FOUND", "Instrumen sumber tidak ditemukan.");

    const inactive = await listInactiveWithResponses(source.targetRole);
    const existingDraft = inactive.find((row) => row.responseCount === 0);
    if (existingDraft) {
      throw new AppError(
        "CONFLICT",
        `Sudah ada draf ${existingDraft.code}. Aktifkan atau hapus draf itu dulu sebelum membuat yang baru.`,
      );
    }

    const version = (await maxVersionForRole(source.targetRole)) + 1;
    const code = `${source.targetRole}_V${version}`;
    const id = await db.transaction((tx) => cloneInstrument(tx, source, { code, version }));
    return { instrumentId: id, code };
  },

  async saveQuestion(instrumentId: string, questionId: string | null, input: QuestionFormInput) {
    await assertEditable(instrumentId);
    const values = toQuestionValues(input);
    const labels = input.options.map((option) => option.label);

    try {
      await db.transaction(async (tx) => {
        if (questionId) {
          const existing = await findQuestion(instrumentId, questionId);
          if (!existing) throw new AppError("NOT_FOUND", "Butir tidak ditemukan.");
          await updateQuestion(tx, questionId, values);
          await replaceOptions(tx, questionId, labels);
          return;
        }
        const newId = await insertQuestion(tx, instrumentId, values);
        await replaceOptions(tx, newId, labels);
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppError("CONFLICT", `Kode butir ${input.key} sudah dipakai di versi ini.`);
      }
      throw error;
    }
  },

  async deleteQuestion(instrumentId: string, questionId: string) {
    await assertEditable(instrumentId);
    if (!(await findQuestion(instrumentId, questionId))) {
      throw new AppError("NOT_FOUND", "Butir tidak ditemukan.");
    }
    await deleteQuestionById(questionId);
  },

  async moveQuestion(instrumentId: string, questionId: string, direction: "UP" | "DOWN") {
    await assertEditable(instrumentId);
    const ordered = await listQuestionsDetailed(instrumentId);
    const index = ordered.findIndex((q) => q.id === questionId);
    const neighbor = ordered[direction === "UP" ? index - 1 : index + 1];
    const current = ordered[index];
    if (index < 0 || !current || !neighbor) return;
    await db.transaction((tx) => swapSortOrder(tx, current, neighbor));
  },

  /** Mengaktifkan versi draf; versi aktif sebelumnya menjadi arsip (tetap tersimpan untuk hasil lama). */
  async activate(instrumentId: string) {
    const instrument = await assertEditable(instrumentId);
    const questions = await listQuestionsDetailed(instrumentId);
    const issues = findActivationIssues(
      questions.map((q) => ({
        key: q.key,
        type: q.type,
        dimensionId: q.dimensionId,
        optionCount: q.options.length,
      })),
    );
    if (issues.length > 0) {
      throw new AppError("RULE_VIOLATION", `Belum bisa diaktifkan: ${issues.join(" ")}`);
    }
    await db.transaction((tx) => activateInstrument(tx, instrumentId, instrument.targetRole));
  },

  async deleteDraft(instrumentId: string) {
    await assertEditable(instrumentId);
    await deleteInstrumentById(instrumentId);
  },

  listDimensions,

  async updateDimension(input: DimensionFormInput) {
    await updateDimensionById(input.dimensionId, {
      name: input.name,
      description: input.description,
      nameEn: input.nameEn ? input.nameEn : null,
      descriptionEn: input.descriptionEn ? input.descriptionEn : null,
    });
  },
};
