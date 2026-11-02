import { describe, expect, it } from "vitest";

import { dimensionScore, itemScore } from "../item";
import type { Polarity, ScoredItem } from "../types";

const item = (value: number | null, polarity: Polarity = "POSITIVE", weight = 1): ScoredItem => ({
  value,
  polarity,
  weight,
});

describe("itemScore", () => {
  it("butir positif: nilai dikurangi min", () => {
    expect(itemScore(5, "POSITIVE")).toBe(4);
    expect(itemScore(1, "POSITIVE")).toBe(0);
  });

  it("butir negatif dibalik", () => {
    expect(itemScore(5, "NEGATIVE")).toBe(0);
    expect(itemScore(1, "NEGATIVE")).toBe(4);
    expect(itemScore(3, "NEGATIVE")).toBe(2);
  });

  it("menolak nilai di luar skala atau bukan bilangan bulat", () => {
    expect(() => itemScore(0, "POSITIVE")).toThrow(RangeError);
    expect(() => itemScore(6, "POSITIVE")).toThrow(RangeError);
    expect(() => itemScore(2.5, "POSITIVE")).toThrow(RangeError);
  });
});

describe("dimensionScore", () => {
  it("semua 5 pada butir positif → 100", () => {
    expect(dimensionScore([item(5), item(5), item(5)])).toBe(100);
  });

  it("semua 1 pada butir positif → 0", () => {
    expect(dimensionScore([item(1), item(1)])).toBe(0);
  });

  it("jawaban 1 pada butir negatif setara 5 pada butir positif", () => {
    expect(dimensionScore([item(5), item(1, "NEGATIVE")])).toBe(100);
  });

  it("butir bernilai 3 menghasilkan titik tengah 50", () => {
    expect(dimensionScore([item(3), item(3, "NEGATIVE")])).toBe(50);
  });

  it("memperhitungkan bobot butir", () => {
    // (4*1 + 0*3) / (4 * 4) * 100 = 25
    expect(dimensionScore([item(5, "POSITIVE", 1), item(1, "POSITIVE", 3)])).toBe(25);
  });

  it("contoh SUS standar: Σ = 27 → 67,5", () => {
    // Ganjil POSITIVE, genap NEGATIVE; Σ kontribusi × 2,5 = skor SUS.
    const answers = [4, 2, 4, 2, 4, 2, 4, 3, 3, 3];
    const items = answers.map((value, index) =>
      item(value, index % 2 === 0 ? "POSITIVE" : "NEGATIVE"),
    );
    expect(dimensionScore(items)).toBeCloseTo(67.5, 10);
  });

  it("N/A keluar dari pembilang dan penyebut", () => {
    // Hanya butir 5 yang dihitung → 100, bukan 50.
    expect(dimensionScore([item(5), item(null)])).toBe(100);
  });

  it("seluruh butir N/A atau daftar kosong → null", () => {
    expect(dimensionScore([item(null), item(null)])).toBeNull();
    expect(dimensionScore([])).toBeNull();
  });

  it("mendukung skala lain", () => {
    expect(dimensionScore([item(7)], { min: 1, max: 7 })).toBe(100);
  });
});
