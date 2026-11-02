import { AppError } from "@/lib/errors";

import type { AnswerEntry } from "./types";

export type QuestionRule = {
  id: string;
  type: "LIKERT" | "BOOLEAN" | "CHOICE";
  allowNotApplicable: boolean;
  optionIds: readonly string[];
};

/**
 * Memastikan setiap jawaban cocok dengan butirnya (aturan BACKEND.md §5 `survey`):
 * butir milik instrumen ini, tipe sesuai, N/A hanya jika diizinkan, opsi milik butir itu.
 * Zod sudah menjamin bentuk dan rentang; ini menjamin kecocokan dengan data instrumen.
 */
export function validateAnswers(
  questions: readonly QuestionRule[],
  entries: readonly AnswerEntry[],
) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const seen = new Set<string>();

  for (const entry of entries) {
    const question = byId.get(entry.questionId);
    if (!question)
      throw new AppError(
        "VALIDATION",
        "Ada jawaban untuk butir yang bukan bagian dari kuesioner ini.",
      );
    if (seen.has(entry.questionId))
      throw new AppError("VALIDATION", "Ada butir yang dijawab lebih dari sekali.");
    seen.add(entry.questionId);

    switch (entry.kind) {
      case "likert":
        if (question.type !== "LIKERT") throw mismatch();
        break;
      case "na":
        if (question.type !== "LIKERT" || !question.allowNotApplicable) {
          throw new AppError("VALIDATION", 'Butir ini tidak menyediakan pilihan "Tidak berlaku".');
        }
        break;
      case "boolean":
        if (question.type !== "BOOLEAN") throw mismatch();
        break;
      case "choice":
        if (question.type !== "CHOICE" || !question.optionIds.includes(entry.optionId))
          throw mismatch();
        break;
    }
  }
}

/** Kirim final hanya sah jika semua butir sudah dijawab. */
export function assertComplete(
  questions: readonly QuestionRule[],
  answeredIds: ReadonlySet<string>,
) {
  const missing = questions.filter((question) => !answeredIds.has(question.id)).length;
  if (missing > 0) {
    throw new AppError("RULE_VIOLATION", `Masih ada ${missing} butir yang belum dijawab.`);
  }
}

function mismatch() {
  return new AppError("VALIDATION", "Bentuk jawaban tidak sesuai dengan jenis butir.");
}
