export type ResultCategory = "HEALTHY" | "FAIR" | "AT_RISK";

export const CATEGORY_LABELS: Record<ResultCategory, string> = {
  HEALTHY: "Sehat",
  FAIR: "Cukup",
  AT_RISK: "Perlu Perhatian",
};
