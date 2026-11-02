import { and, eq } from "drizzle-orm";
import "server-only";

import type { Locale } from "@/lib/i18n/config";
import { db } from "@/server/db/client";
import { siteContent } from "@/server/db/schema";

export async function findSectionsForLocale(locale: Locale) {
  return db.select().from(siteContent).where(eq(siteContent.locale, locale));
}

export async function upsertSection(
  section: string,
  locale: Locale,
  data: unknown,
  adminId: string,
) {
  await db
    .insert(siteContent)
    .values({ section, locale, data, updatedBy: adminId })
    .onConflictDoUpdate({
      target: [siteContent.section, siteContent.locale],
      set: { data, updatedBy: adminId, updatedAt: new Date() },
    });
}

export async function deleteSection(section: string, locale: Locale) {
  await db
    .delete(siteContent)
    .where(and(eq(siteContent.section, section), eq(siteContent.locale, locale)));
}
