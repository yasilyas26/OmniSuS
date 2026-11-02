import type { Polarity, Scale, ScoredItem } from "./types";

export const DEFAULT_SCALE: Scale = { min: 1, max: 5 };
const PERCENT = 100;

/** Normalisasi satu jawaban Likert ke 0..(max−min); butir negatif dibalik. */
export function itemScore(
  value: number,
  polarity: Polarity,
  { min, max }: Scale = DEFAULT_SCALE,
): number {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`Nilai ${value} di luar skala ${min}–${max}`);
  }
  return polarity === "POSITIVE" ? value - min : max - value;
}

/**
 * Skor satu faktor 0–100 untuk satu responden.
 * Butir `value: null` ("Tidak berlaku") keluar dari pembilang dan penyebut.
 * Mengembalikan null jika tidak ada butir yang tersisa.
 */
export function dimensionScore(
  items: readonly ScoredItem[],
  scale: Scale = DEFAULT_SCALE,
): number | null {
  let weightSum = 0;
  let rawSum = 0;
  for (const item of items) {
    if (item.value === null) continue;
    weightSum += item.weight;
    rawSum += itemScore(item.value, item.polarity, scale) * item.weight;
  }
  if (weightSum === 0) return null;
  return (rawSum / (weightSum * (scale.max - scale.min))) * PERCENT;
}
