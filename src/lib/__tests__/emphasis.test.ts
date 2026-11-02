import { describe, expect, it } from "vitest";

import { fillTokens, splitEmphasis } from "../emphasis";

describe("splitEmphasis", () => {
  it("memisahkan kata beremfasis di tengah kalimat", () => {
    expect(splitEmphasis("Cari tahu seberapa *sehat* UMKM-mu")).toEqual([
      { text: "Cari tahu seberapa ", emphasized: false },
      { text: "sehat", emphasized: true },
      { text: " UMKM-mu", emphasized: false },
    ]);
  });

  it("mendukung emfasis di awal, akhir, dan lebih dari satu", () => {
    expect(splitEmphasis("*Satu* dan *dua*")).toEqual([
      { text: "Satu", emphasized: true },
      { text: " dan ", emphasized: false },
      { text: "dua", emphasized: true },
    ]);
  });

  it("tanpa penanda mengembalikan satu bagian biasa", () => {
    expect(splitEmphasis("Tanpa emfasis")).toEqual([{ text: "Tanpa emfasis", emphasized: false }]);
  });

  it("tanda bintang tunggal yang tidak berpasangan dibiarkan sebagai teks", () => {
    expect(splitEmphasis("Harga * tidak berpasangan")).toEqual([
      { text: "Harga * tidak berpasangan", emphasized: false },
    ]);
  });

  it("teks kosong tidak menghasilkan bagian", () => {
    expect(splitEmphasis("")).toEqual([]);
  });
});

describe("fillTokens", () => {
  it("mengisi token yang dikenal", () => {
    expect(fillTokens("minimal {min} orang", { min: 3 })).toBe("minimal 3 orang");
  });

  it("membiarkan token yang tidak dikenal", () => {
    expect(fillTokens("halo {nama}", { min: 3 })).toBe("halo {nama}");
  });
});
