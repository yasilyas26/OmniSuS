import type { Category } from "./types";

// Ambang sementara (PRD §7.2, Q3): belum tervalidasi, dinyatakan di /metodologi.
export const HEALTHY_MIN_SCORE = 75;
export const FAIR_MIN_SCORE = 50;

export function categorize(score: number): Category {
  if (score >= HEALTHY_MIN_SCORE) return "HEALTHY";
  if (score >= FAIR_MIN_SCORE) return "FAIR";
  return "AT_RISK";
}
