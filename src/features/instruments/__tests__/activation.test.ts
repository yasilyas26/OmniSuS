import { describe, expect, it } from "vitest";

import { type QuestionSummary, findActivationIssues } from "../activation";

const likert = (key: string, dimensionId: string | null = "d1"): QuestionSummary => ({
  key,
  type: "LIKERT",
  dimensionId,
  optionCount: 0,
});

describe("findActivationIssues", () => {
  it("instrumen kosong tidak boleh diaktifkan", () => {
    expect(findActivationIssues([])).toEqual(["Instrumen belum memiliki butir."]);
  });

  it("butir Likert berfaktor sudah cukup", () => {
    expect(findActivationIssues([likert("A1")])).toEqual([]);
  });

  it("hanya butir tanpa faktor (profil/cross-check) tidak cukup untuk dihitung", () => {
    const issues = findActivationIssues([
      likert("X1", null),
      { key: "P1", type: "BOOLEAN", dimensionId: null, optionCount: 0 },
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("faktor");
  });

  it("butir pilihan wajib punya minimal dua opsi", () => {
    const issues = findActivationIssues([
      likert("A1"),
      { key: "P4", type: "CHOICE", dimensionId: null, optionCount: 1 },
    ]);
    expect(issues).toEqual(["Butir P4 bertipe pilihan tetapi opsinya kurang dari 2."]);
  });

  it("melaporkan beberapa masalah sekaligus", () => {
    const issues = findActivationIssues([
      { key: "P4", type: "CHOICE", dimensionId: null, optionCount: 0 },
    ]);
    expect(issues).toHaveLength(2);
  });
});
