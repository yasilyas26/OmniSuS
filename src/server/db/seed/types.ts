export type DimensionKey =
  | "leadership"
  | "work_environment"
  | "work_culture"
  | "resources_operations"
  | "market_customers"
  | "finance";

export type SeedQuestion = {
  key: string;
  type: "LIKERT" | "BOOLEAN" | "CHOICE";
  dimension: DimensionKey | null;
  text: string;
  polarity?: "POSITIVE" | "NEGATIVE";
  allowNotApplicable?: boolean;
  pairKey?: string;
  options?: readonly string[];
};

export type SeedInstrument = {
  code: string;
  targetRole: "OWNER" | "EMPLOYEE";
  version: number;
  scaleMin: number;
  scaleMax: number;
  questions: readonly SeedQuestion[];
};

type LikertExtras = Pick<SeedQuestion, "allowNotApplicable" | "pairKey">;

export const likert = (
  key: string,
  dimension: DimensionKey | null,
  text: string,
  polarity: "POSITIVE" | "NEGATIVE" = "POSITIVE",
  extras: LikertExtras = {},
): SeedQuestion => ({ key, type: "LIKERT", dimension, text, polarity, ...extras });
