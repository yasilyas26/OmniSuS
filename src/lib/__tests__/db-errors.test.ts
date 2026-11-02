import { describe, expect, it } from "vitest";

import { isUniqueViolation } from "../db-errors";

describe("isUniqueViolation", () => {
  it("mengenali kode 23505 langsung pada galat", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
  });

  it("mengenali kode 23505 pada cause (galat dibungkus Drizzle)", () => {
    const wrapped = new Error("Failed query", { cause: { code: "23505" } });
    expect(isUniqueViolation(wrapped)).toBe(true);
  });

  it("menolak galat lain", () => {
    expect(isUniqueViolation({ code: "23503" })).toBe(false);
    expect(isUniqueViolation(new Error("x", { cause: { code: "42P01" } }))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation("23505")).toBe(false);
  });
});
