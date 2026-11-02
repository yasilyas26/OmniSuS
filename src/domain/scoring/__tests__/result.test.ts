import { describe, expect, it } from "vitest";

import { computeAssessmentResult } from "../result";
import type { AnswerDef, ComputeResultInput, DimensionDef, QuestionDef } from "../types";

const SHARED: DimensionDef = { id: "d-lead", isShared: true, weight: 1 };
const OWNER_ONLY: DimensionDef = { id: "d-fin", isShared: false, weight: 1 };

const likertQ = (
  id: string,
  dimensionId: string | null,
  polarity: "POSITIVE" | "NEGATIVE" = "POSITIVE",
  pairKey: string | null = null,
): QuestionDef => ({ id, type: "LIKERT", dimensionId, polarity, weight: 1, pairKey });

const answer = (questionId: string, likertValue: number): AnswerDef => ({
  questionId,
  likertValue,
  isNotApplicable: false,
});
const na = (questionId: string): AnswerDef => ({
  questionId,
  likertValue: null,
  isNotApplicable: true,
});

const ownerQuestions = [
  likertQ("o-lead-1", SHARED.id),
  likertQ("o-lead-2", SHARED.id, "NEGATIVE"),
  likertQ("o-fin-1", OWNER_ONLY.id),
  likertQ("o-fin-2", OWNER_ONLY.id, "POSITIVE", "salary"),
];
const employeeQuestions = [
  likertQ("e-lead-1", SHARED.id),
  likertQ("e-lead-2", SHARED.id, "NEGATIVE"),
  likertQ("e-xc", null, "POSITIVE", "salary"),
];

const ownerPerfect = [
  answer("o-lead-1", 5),
  answer("o-lead-2", 1),
  answer("o-fin-1", 5),
  answer("o-fin-2", 5),
];
const employeeWorst = [answer("e-lead-1", 1), answer("e-lead-2", 5), answer("e-xc", 1)];
const employeeBest = [answer("e-lead-1", 5), answer("e-lead-2", 1), answer("e-xc", 5)];

function input(overrides: Partial<ComputeResultInput> = {}): ComputeResultInput {
  return {
    dimensions: [SHARED, OWNER_ONLY],
    ownerQuestions,
    employeeQuestions,
    ownerAnswers: ownerPerfect,
    employeeAnswers: [employeeWorst, employeeWorst, employeeWorst],
    scale: { min: 1, max: 5 },
    minEmployeeResponses: 3,
    ownerWeight: 0.5,
    ...overrides,
  };
}

describe("computeAssessmentResult", () => {
  it("menghitung skor owner, karyawan, gabungan, kategori, dan gap", () => {
    const result = computeAssessmentResult(input());

    expect(result.ownerScore).toBe(100);
    expect(result.employeeScore).toBe(0);
    expect(result.employeeRespondents).toBe(3);
    expect(result.combinedScore).toBe(50);
    expect(result.category).toBe("FAIR");

    const lead = result.dimensions.find((d) => d.dimensionId === SHARED.id);
    expect(lead).toEqual({ dimensionId: SHARED.id, ownerScore: 100, employeeScore: 0, gap: 100 });
  });

  it("gap tidak dihitung untuk faktor khusus owner", () => {
    const result = computeAssessmentResult(input());
    const fin = result.dimensions.find((d) => d.dimensionId === OWNER_ONLY.id);
    expect(fin).toEqual({
      dimensionId: OWNER_ONLY.id,
      ownerScore: 100,
      employeeScore: null,
      gap: null,
    });
  });

  it("responden di bawah minimum: data karyawan disembunyikan, hanya skor owner", () => {
    const result = computeAssessmentResult(
      input({ employeeAnswers: [employeeWorst, employeeWorst] }),
    );

    expect(result.employeeScore).toBeNull();
    expect(result.employeeRespondents).toBe(2);
    expect(result.combinedScore).toBe(100);
    expect(result.dimensions.every((d) => d.employeeScore === null && d.gap === null)).toBe(true);
    expect(result.crossChecks[0]?.employeeMean).toBeNull();
  });

  it("tanpa karyawan sama sekali", () => {
    const result = computeAssessmentResult(input({ employeeAnswers: [] }));
    expect(result.employeeScore).toBeNull();
    expect(result.combinedScore).toBe(100);
    expect(result.category).toBe("HEALTHY");
  });

  it("skor karyawan dirata-ratakan per responden", () => {
    const result = computeAssessmentResult(
      input({ employeeAnswers: [employeeBest, employeeWorst, employeeWorst, employeeBest] }),
    );
    expect(result.employeeScore).toBe(50);
  });

  it("butir N/A sebagian dikeluarkan dari faktor", () => {
    const result = computeAssessmentResult(
      input({
        ownerAnswers: [
          answer("o-lead-1", 5),
          answer("o-lead-2", 1),
          na("o-fin-1"),
          answer("o-fin-2", 1),
        ],
      }),
    );
    const fin = result.dimensions.find((d) => d.dimensionId === OWNER_ONLY.id);
    expect(fin?.ownerScore).toBe(0);
  });

  it("faktor yang seluruhnya N/A tidak ikut skor total (bobot dinormalisasi ulang)", () => {
    const result = computeAssessmentResult(
      input({
        ownerAnswers: [answer("o-lead-1", 5), answer("o-lead-2", 1), na("o-fin-1"), na("o-fin-2")],
      }),
    );
    const fin = result.dimensions.find((d) => d.dimensionId === OWNER_ONLY.id);
    expect(fin?.ownerScore).toBeNull();
    expect(result.ownerScore).toBe(100);
  });

  it("butir BOOLEAN dan CHOICE tidak memengaruhi skor", () => {
    const profile: QuestionDef[] = [
      { id: "p1", type: "BOOLEAN", dimensionId: null, polarity: null, weight: 1, pairKey: null },
      { id: "p4", type: "CHOICE", dimensionId: null, polarity: null, weight: 1, pairKey: null },
    ];
    const profileAnswers: AnswerDef[] = [
      { questionId: "p1", likertValue: null, isNotApplicable: false },
      { questionId: "p4", likertValue: null, isNotApplicable: false },
    ];
    const base = computeAssessmentResult(input());
    const withProfile = computeAssessmentResult(
      input({
        ownerQuestions: [...profile, ...ownerQuestions],
        ownerAnswers: [...profileAnswers, ...ownerPerfect],
      }),
    );
    expect(withProfile).toEqual(base);
  });

  it("butir cross-check: nilai owner vs rata-rata karyawan", () => {
    const result = computeAssessmentResult(
      input({ employeeAnswers: [employeeBest, employeeWorst, employeeWorst] }),
    );
    expect(result.crossChecks).toEqual([{ pairKey: "salary", ownerValue: 5, employeeMean: 2.33 }]);
  });

  it("butir cross-check tanpa dimensi tidak masuk skor faktor", () => {
    const withXc = computeAssessmentResult(input());
    const withoutXc = computeAssessmentResult(
      input({
        employeeQuestions: employeeQuestions.filter((q) => q.id !== "e-xc"),
        employeeAnswers: [employeeWorst, employeeWorst, employeeWorst].map((a) =>
          a.filter((x) => x.questionId !== "e-xc"),
        ),
      }),
    );
    expect(withXc.employeeScore).toBe(withoutXc.employeeScore);
  });

  it("melempar error jika owner tidak punya butir terskor", () => {
    expect(() => computeAssessmentResult(input({ ownerAnswers: [], ownerQuestions: [] }))).toThrow(
      RangeError,
    );
  });
});
