export type Polarity = "POSITIVE" | "NEGATIVE";
export type Category = "HEALTHY" | "FAIR" | "AT_RISK";

/** Butir Likert yang ikut dihitung. `value` null = dijawab "Tidak berlaku" (dikeluarkan). */
export type ScoredItem = {
  value: number | null;
  polarity: Polarity;
  weight: number;
};

export type Scale = { min: number; max: number };

export type QuestionDef = {
  id: string;
  type: "LIKERT" | "BOOLEAN" | "CHOICE";
  dimensionId: string | null;
  polarity: Polarity | null;
  weight: number;
  pairKey: string | null;
};

export type AnswerDef = {
  questionId: string;
  likertValue: number | null;
  isNotApplicable: boolean;
};

export type DimensionDef = {
  id: string;
  isShared: boolean;
  weight: number;
};

export type ComputeResultInput = {
  dimensions: readonly DimensionDef[];
  ownerQuestions: readonly QuestionDef[];
  employeeQuestions: readonly QuestionDef[];
  ownerAnswers: readonly AnswerDef[];
  /** Satu elemen per karyawan yang sudah submit final. */
  employeeAnswers: readonly (readonly AnswerDef[])[];
  scale: Scale;
  minEmployeeResponses: number;
  ownerWeight: number;
};

export type DimensionResultValue = {
  dimensionId: string;
  ownerScore: number | null;
  employeeScore: number | null;
  /** owner − karyawan; hanya untuk faktor bersama dan jika kedua skor ada. */
  gap: number | null;
};

export type CrossCheckValue = {
  pairKey: string;
  ownerValue: number | null;
  employeeMean: number | null;
};

export type AssessmentResultValue = {
  ownerScore: number;
  employeeScore: number | null;
  employeeRespondents: number;
  combinedScore: number;
  category: Category;
  dimensions: DimensionResultValue[];
  crossChecks: CrossCheckValue[];
};
