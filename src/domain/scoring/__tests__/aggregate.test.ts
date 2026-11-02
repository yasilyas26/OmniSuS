import { describe, expect, it } from "vitest";

import { combinedScore, mean, overallScore, round2 } from "../aggregate";
import { categorize } from "../category";

describe("categorize", () => {
  it.each([
    [0, "AT_RISK"],
    [49.99, "AT_RISK"],
    [50, "FAIR"],
    [74.99, "FAIR"],
    [75, "HEALTHY"],
    [100, "HEALTHY"],
  ] as const)("skor %s → %s", (score, expected) => {
    expect(categorize(score)).toBe(expected);
  });
});

describe("overallScore", () => {
  it("rata-rata berbobot", () => {
    expect(
      overallScore([
        { score: 100, weight: 1 },
        { score: 0, weight: 3 },
      ]),
    ).toBe(25);
  });

  it("faktor null dikeluarkan dan bobot dinormalisasi ulang", () => {
    expect(
      overallScore([
        { score: 80, weight: 1 },
        { score: null, weight: 5 },
      ]),
    ).toBe(80);
  });

  it("semua null → null", () => {
    expect(overallScore([{ score: null, weight: 1 }])).toBeNull();
  });
});

describe("combinedScore", () => {
  it("bobot default 50/50", () => {
    expect(combinedScore(80, 40, 0.5)).toBe(60);
  });

  it("tanpa data karyawan memakai skor owner", () => {
    expect(combinedScore(80, null, 0.5)).toBe(80);
  });

  it("menolak bobot di luar 0..1", () => {
    expect(() => combinedScore(80, 40, 1.2)).toThrow(RangeError);
  });
});

describe("mean & round2", () => {
  it("mean daftar kosong → null", () => {
    expect(mean([])).toBeNull();
    expect(mean([2, 4])).toBe(3);
  });

  it("round2 membulatkan ke 2 desimal", () => {
    expect(round2(66.666666)).toBe(66.67);
    expect(round2(1.005)).toBe(1.01);
  });
});
