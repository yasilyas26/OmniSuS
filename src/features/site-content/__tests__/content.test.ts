import { describe, expect, it } from "vitest";

import { LOCALES } from "@/lib/i18n/config";

import { DEFAULT_CONTENT } from "../defaults";
import { SECTION_KEYS, siteContentSchemas } from "../schemas";

describe.each(LOCALES)("konten landing bawaan (%s)", (locale) => {
  it.each(SECTION_KEYS)("section %s lolos schemanya sendiri", (key) => {
    expect(siteContentSchemas[key].safeParse(DEFAULT_CONTENT[locale][key]).success).toBe(true);
  });
});

describe("schema konten", () => {
  const base = DEFAULT_CONTENT.id;

  it("menolak ikon yang tidak ada di daftar", () => {
    const bad = {
      ...base.coreFeatures,
      items: [{ icon: "tidak-ada", title: "x", description: "y" }],
    };
    expect(siteContentSchemas.coreFeatures.safeParse(bad).success).toBe(false);
  });

  it("menolak teks kosong dan teks terlalu panjang", () => {
    expect(siteContentSchemas.cta.safeParse({ ...base.cta, title: "   " }).success).toBe(false);
    expect(siteContentSchemas.cta.safeParse({ ...base.cta, title: "x".repeat(141) }).success).toBe(
      false,
    );
  });

  it("menolak daftar item yang melebihi batas", () => {
    const tooMany = {
      ...base.partners,
      items: Array.from({ length: 13 }, (_, i) => ({ name: `Logo ${i}`, icon: "store" as const })),
    };
    expect(siteContentSchemas.partners.safeParse(tooMany).success).toBe(false);
  });

  it("kedua bahasa memiliki jumlah item yang setara agar tata letak tidak berbeda", () => {
    expect(DEFAULT_CONTENT.en.coreFeatures.items).toHaveLength(base.coreFeatures.items.length);
    expect(DEFAULT_CONTENT.en.testimonials.items).toHaveLength(base.testimonials.items.length);
    expect(DEFAULT_CONTENT.en.privacy.points).toHaveLength(base.privacy.points.length);
  });
});
