import "server-only";

import type { Locale } from "@/lib/i18n/config";

import { DEFAULT_CONTENT } from "./defaults";
import { deleteSection, findSectionsForLocale, upsertSection } from "./repository";
import { SECTION_KEYS, type SectionKey, type SiteContent, siteContentSchemas } from "./schemas";

export const siteContentService = {
  /**
   * Konten landing yang berlaku untuk satu bahasa: simpanan admin bila ada dan masih valid,
   * kalau tidak teks bawaan. Section yang rusak (mis. schema berubah) jatuh ke bawaan agar
   * landing tidak pernah error.
   */
  async get(locale: Locale): Promise<SiteContent> {
    const stored = new Map(
      (await findSectionsForLocale(locale)).map((row) => [row.section, row.data]),
    );
    const result: Record<string, unknown> = {};
    for (const key of SECTION_KEYS) {
      const parsed = siteContentSchemas[key].safeParse(stored.get(key));
      result[key] = parsed.success ? parsed.data : DEFAULT_CONTENT[locale][key];
    }
    return result as SiteContent;
  },

  /** Untuk editor admin: section mana yang sudah diubah dari bawaan pada bahasa ini. */
  async getCustomizedKeys(locale: Locale): Promise<Set<SectionKey>> {
    const rows = await findSectionsForLocale(locale);
    return new Set(SECTION_KEYS.filter((key) => rows.some((row) => row.section === key)));
  },

  async save(adminId: string, section: SectionKey, locale: Locale, data: unknown) {
    const valid = siteContentSchemas[section].parse(data);
    await upsertSection(section, locale, valid, adminId);
  },

  async reset(section: SectionKey, locale: Locale) {
    await deleteSection(section, locale);
  },
};
