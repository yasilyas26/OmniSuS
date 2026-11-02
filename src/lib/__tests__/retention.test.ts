import { describe, expect, it } from "vitest";

import { DELETION_GRACE_DAYS, daysUntilPurge } from "../retention";

describe("daysUntilPurge", () => {
  const deletedAt = new Date("2026-01-01T00:00:00Z");

  it("penuh tepat setelah dihapus", () => {
    expect(daysUntilPurge(deletedAt, deletedAt)).toBe(DELETION_GRACE_DAYS);
  });

  it("berkurang seiring waktu", () => {
    expect(daysUntilPurge(deletedAt, new Date("2026-01-11T00:00:00Z"))).toBe(20);
  });

  it("tidak negatif setelah masa tenggang lewat", () => {
    expect(daysUntilPurge(deletedAt, new Date("2026-06-01T00:00:00Z"))).toBe(0);
  });
});
