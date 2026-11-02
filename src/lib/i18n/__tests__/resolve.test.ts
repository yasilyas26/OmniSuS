import { describe, expect, it } from "vitest";

import { parseAcceptLanguage, resolveLocale } from "../resolve";

describe("parseAcceptLanguage", () => {
  it("mengurutkan berdasarkan nilai q lalu urutan kemunculan", () => {
    expect(parseAcceptLanguage("en;q=0.7, id-ID, fr;q=0.9")).toEqual(["id-id", "fr", "en"]);
  });

  it("mengabaikan wildcard, q=0, dan header kosong", () => {
    expect(parseAcceptLanguage("*, de;q=0, id")).toEqual(["id"]);
    expect(parseAcceptLanguage("")).toEqual([]);
    expect(parseAcceptLanguage(null)).toEqual([]);
  });
});

describe("resolveLocale", () => {
  it("perangkat Indonesia + di Indonesia → Indonesia", () => {
    expect(resolveLocale({ acceptLanguage: "id-ID,id;q=0.9,en;q=0.8", country: "ID" })).toBe("id");
  });

  it("perangkat Inggris + tinggal di Indonesia → tetap Inggris", () => {
    expect(resolveLocale({ acceptLanguage: "en-US,en;q=0.9", country: "ID" })).toBe("en");
  });

  it("perangkat Indonesia tetapi mengakses dari luar negeri → Inggris", () => {
    expect(resolveLocale({ acceptLanguage: "id-ID,id;q=0.9", country: "SG" })).toBe("en");
    expect(resolveLocale({ acceptLanguage: "id", country: "us" })).toBe("en");
  });

  it("perangkat dan lokasi non-Indonesia → Inggris", () => {
    expect(resolveLocale({ acceptLanguage: "fr-FR", country: "FR" })).toBe("en");
  });

  it("negara tidak diketahui: memakai bahasa perangkat saja", () => {
    expect(resolveLocale({ acceptLanguage: "id-ID" })).toBe("id");
    expect(resolveLocale({ acceptLanguage: "en-GB" })).toBe("en");
  });

  it("tanpa Accept-Language → Inggris", () => {
    expect(resolveLocale({ country: "ID" })).toBe("en");
    expect(resolveLocale({})).toBe("en");
  });

  it("bahasa Indonesia harus yang utama, bukan sekadar ada di daftar", () => {
    expect(resolveLocale({ acceptLanguage: "en-US,id;q=0.5", country: "ID" })).toBe("en");
  });

  it("mengenali kode lama 'in'", () => {
    expect(resolveLocale({ acceptLanguage: "in-ID", country: "ID" })).toBe("id");
  });

  it("pilihan manual (cookie) mengalahkan semua deteksi", () => {
    expect(resolveLocale({ cookie: "en", acceptLanguage: "id-ID", country: "ID" })).toBe("en");
    expect(resolveLocale({ cookie: "id", acceptLanguage: "en-US", country: "SG" })).toBe("id");
  });

  it("cookie tidak valid diabaikan", () => {
    expect(resolveLocale({ cookie: "xx", acceptLanguage: "id-ID", country: "ID" })).toBe("id");
  });
});
