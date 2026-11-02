import { z } from "zod";

import { ICON_NAMES } from "@/components/marketing/icons";

const short = (label: string, max: number) =>
  z.string().trim().min(1, `${label} wajib diisi.`).max(max, `${label} maksimal ${max} karakter.`);

const icon = z.enum(ICON_NAMES, { error: "Pilih ikon." });

export const SECTION_KEYS = [
  "hero",
  "partners",
  "about",
  "effectiveness",
  "coreFeatures",
  "benefits",
  "privacy",
  "testimonials",
  "cta",
  "footer",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

const titled = { title: short("Judul", 140) };

export const siteContentSchemas = {
  hero: z.object({
    ...titled,
    description: short("Deskripsi", 300),
    primaryCta: short("Tombol utama", 30),
    secondaryCta: short("Tombol kedua", 30),
  }),
  partners: z.object({
    caption: z.string().trim().max(120, "Keterangan maksimal 120 karakter."),
    items: z
      .array(z.object({ name: short("Nama", 40), icon }))
      .min(2, "Minimal 2 logo.")
      .max(12, "Maksimal 12 logo."),
  }),
  about: z.object({
    ...titled,
    description: short("Deskripsi", 500),
    facts: z
      .array(z.object({ value: short("Angka", 12), label: short("Keterangan", 80) }))
      .min(1)
      .max(4),
  }),
  effectiveness: z.object({
    ...titled,
    description: short("Deskripsi", 300),
    disclaimer: short("Catatan batasan", 400),
  }),
  coreFeatures: z.object({
    ...titled,
    items: z
      .array(z.object({ icon, title: short("Judul", 50), description: short("Deskripsi", 240) }))
      .min(1)
      .max(6),
  }),
  benefits: z.object({
    ...titled,
    items: z
      .array(z.object({ icon, title: short("Judul", 50), description: short("Deskripsi", 240) }))
      .min(1)
      .max(6),
  }),
  privacy: z.object({
    ...titled,
    description: short("Deskripsi", 300),
    points: z
      .array(z.object({ icon, title: short("Judul", 60), text: short("Teks", 200) }))
      .min(1)
      .max(4),
    buttonLabel: short("Tombol", 40),
  }),
  testimonials: z.object({
    ...titled,
    description: short("Deskripsi", 200),
    items: z
      .array(
        z.object({
          name: short("Nama", 50),
          role: short("Jabatan", 60),
          quote: short("Kutipan", 300),
        }),
      )
      .min(1)
      .max(10),
  }),
  cta: z.object({
    ...titled,
    description: short("Deskripsi", 240),
    button: short("Tombol", 30),
  }),
  footer: z.object({
    emailLabel: short("Label email", 60),
    note: short("Catatan kaki", 300),
  }),
} satisfies Record<SectionKey, z.ZodType>;

export type SiteContent = { [K in SectionKey]: z.infer<(typeof siteContentSchemas)[K]> };
