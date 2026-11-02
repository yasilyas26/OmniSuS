import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors";

import type { AnswerEntry } from "../types";
import { type QuestionRule, assertComplete, validateAnswers } from "../validate";

const likert: QuestionRule = {
  id: "q-likert",
  type: "LIKERT",
  allowNotApplicable: false,
  optionIds: [],
};
const likertNa: QuestionRule = {
  id: "q-na",
  type: "LIKERT",
  allowNotApplicable: true,
  optionIds: [],
};
const bool: QuestionRule = {
  id: "q-bool",
  type: "BOOLEAN",
  allowNotApplicable: false,
  optionIds: [],
};
const choice: QuestionRule = {
  id: "q-choice",
  type: "CHOICE",
  allowNotApplicable: false,
  optionIds: ["opt-1", "opt-2"],
};
const questions = [likert, likertNa, bool, choice];

const run = (entries: AnswerEntry[]) => () => validateAnswers(questions, entries);

describe("validateAnswers", () => {
  it("menerima jawaban yang cocok dengan jenis butir", () => {
    expect(
      run([
        { kind: "likert", questionId: "q-likert", value: 4 },
        { kind: "na", questionId: "q-na" },
        { kind: "boolean", questionId: "q-bool", value: true },
        { kind: "choice", questionId: "q-choice", optionId: "opt-2" },
      ]),
    ).not.toThrow();
  });

  it("menolak butir yang bukan milik instrumen", () => {
    expect(run([{ kind: "likert", questionId: "asing", value: 3 }])).toThrow(AppError);
  });

  it("menolak butir yang dijawab dua kali", () => {
    expect(
      run([
        { kind: "likert", questionId: "q-likert", value: 3 },
        { kind: "likert", questionId: "q-likert", value: 4 },
      ]),
    ).toThrow(AppError);
  });

  it("menolak N/A pada butir yang tidak mengizinkan", () => {
    expect(run([{ kind: "na", questionId: "q-likert" }])).toThrow(AppError);
  });

  it("menolak jawaban Likert pada butir BOOLEAN dan sebaliknya", () => {
    expect(run([{ kind: "likert", questionId: "q-bool", value: 3 }])).toThrow(AppError);
    expect(run([{ kind: "boolean", questionId: "q-likert", value: true }])).toThrow(AppError);
  });

  it("menolak opsi yang bukan milik butir CHOICE itu", () => {
    expect(run([{ kind: "choice", questionId: "q-choice", optionId: "opt-lain" }])).toThrow(
      AppError,
    );
  });
});

describe("assertComplete", () => {
  it("lolos jika semua butir terjawab", () => {
    expect(() => assertComplete(questions, new Set(questions.map((q) => q.id)))).not.toThrow();
  });

  it("gagal dengan RULE_VIOLATION dan menyebut jumlah yang kurang", () => {
    try {
      assertComplete(questions, new Set(["q-likert"]));
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("RULE_VIOLATION");
      expect((error as AppError).message).toContain("3");
    }
  });
});
