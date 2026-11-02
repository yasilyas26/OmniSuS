export type QuestionSummary = {
  key: string;
  type: "LIKERT" | "BOOLEAN" | "CHOICE";
  dimensionId: string | null;
  optionCount: number;
};

export const MIN_CHOICE_OPTIONS = 2;

/**
 * Syarat sebuah versi instrumen boleh diaktifkan. Mengembalikan daftar masalah (kosong = boleh).
 * Mesin skoring butuh minimal satu butir Likert berfaktor; tanpa itu hasil tidak bisa dihitung.
 */
export function findActivationIssues(questions: readonly QuestionSummary[]): string[] {
  const issues: string[] = [];

  if (questions.length === 0) issues.push("Instrumen belum memiliki butir.");

  const scored = questions.filter((q) => q.type === "LIKERT" && q.dimensionId !== null);
  if (questions.length > 0 && scored.length === 0) {
    issues.push(
      "Perlu minimal satu butir Likert yang terhubung ke sebuah faktor agar skor bisa dihitung.",
    );
  }

  for (const question of questions) {
    if (question.type === "CHOICE" && question.optionCount < MIN_CHOICE_OPTIONS) {
      issues.push(
        `Butir ${question.key} bertipe pilihan tetapi opsinya kurang dari ${MIN_CHOICE_OPTIONS}.`,
      );
    }
  }

  return issues;
}
