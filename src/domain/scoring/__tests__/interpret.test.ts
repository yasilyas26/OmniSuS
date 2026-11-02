import { describe, expect, it } from "vitest";

import { NOTABLE_GAP, describeGap } from "../interpret";

describe("describeGap", () => {
  it("owner lebih optimis: gap positif besar", () => {
    expect(describeGap("Keuangan", 18)).toBe(
      "Penilaian owner pada Keuangan 18 poin lebih tinggi dibanding karyawan.",
    );
  });

  it("owner lebih rendah: gap negatif besar", () => {
    expect(describeGap("Kepemimpinan", -25.5)).toBe(
      "Penilaian owner pada Kepemimpinan 25.5 poin lebih rendah dibanding karyawan.",
    );
  });

  it("selisih kecil dianggap selaras, baik positif maupun negatif", () => {
    expect(describeGap("Lingkungan Kerja", 4)).toContain("cukup selaras");
    expect(describeGap("Lingkungan Kerja", -4)).toContain("cukup selaras");
  });

  it("tepat di ambang sudah dianggap berbeda", () => {
    expect(describeGap("Budaya", NOTABLE_GAP)).toContain("lebih tinggi");
    expect(describeGap("Budaya", NOTABLE_GAP - 0.01)).toContain("cukup selaras");
  });
});
