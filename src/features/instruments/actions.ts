"use server";

import { revalidatePath } from "next/cache";

import { toActionResult } from "@/lib/action";
import { writeAudit } from "@/server/audit";
import { requireAdmin } from "@/server/guards";

import {
  dimensionFormSchema,
  instrumentIdSchema,
  moveQuestionSchema,
  questionTargetSchema,
  saveQuestionSchema,
} from "./schemas";
import { instrumentsService } from "./service";

const refreshInstruments = (instrumentId?: string) => {
  revalidatePath("/admin/instrumen");
  if (instrumentId) revalidatePath(`/admin/instrumen/${instrumentId}`);
};

export async function createDraftAction(input: unknown) {
  return toActionResult(async () => {
    const session = await requireAdmin();
    const { instrumentId } = instrumentIdSchema.parse(input);
    const draft = await instrumentsService.createDraft(instrumentId);
    await writeAudit(session.user.id, "instrument.create_draft", instrumentId);
    refreshInstruments();
    return draft;
  });
}

export async function saveQuestionAction(input: unknown) {
  return toActionResult(async () => {
    const session = await requireAdmin();
    const data = saveQuestionSchema.parse(input);
    await instrumentsService.saveQuestion(data.instrumentId, data.questionId, data.question);
    await writeAudit(session.user.id, "question.save", data.instrumentId, {
      key: data.question.key,
    });
    refreshInstruments(data.instrumentId);
  });
}

export async function deleteQuestionAction(input: unknown) {
  return toActionResult(async () => {
    const session = await requireAdmin();
    const { instrumentId, questionId } = questionTargetSchema.parse(input);
    await instrumentsService.deleteQuestion(instrumentId, questionId);
    await writeAudit(session.user.id, "question.delete", instrumentId, { questionId });
    refreshInstruments(instrumentId);
  });
}

export async function moveQuestionAction(input: unknown) {
  return toActionResult(async () => {
    await requireAdmin();
    const { instrumentId, questionId, direction } = moveQuestionSchema.parse(input);
    await instrumentsService.moveQuestion(instrumentId, questionId, direction);
    refreshInstruments(instrumentId);
  });
}

export async function activateInstrumentAction(input: unknown) {
  return toActionResult(async () => {
    const session = await requireAdmin();
    const { instrumentId } = instrumentIdSchema.parse(input);
    await instrumentsService.activate(instrumentId);
    await writeAudit(session.user.id, "instrument.activate", instrumentId);
    refreshInstruments(instrumentId);
  });
}

export async function deleteDraftAction(input: unknown) {
  return toActionResult(async () => {
    const session = await requireAdmin();
    const { instrumentId } = instrumentIdSchema.parse(input);
    await instrumentsService.deleteDraft(instrumentId);
    await writeAudit(session.user.id, "instrument.delete_draft", instrumentId);
    refreshInstruments();
  });
}

export async function updateDimensionAction(input: unknown) {
  return toActionResult(async () => {
    const session = await requireAdmin();
    const data = dimensionFormSchema.parse(input);
    await instrumentsService.updateDimension(data);
    await writeAudit(session.user.id, "dimension.update", data.dimensionId);
    revalidatePath("/admin/faktor");
    // Nama faktor tampil di halaman hasil dan landing publik.
    revalidatePath("/", "layout");
  });
}
