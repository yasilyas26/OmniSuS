"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { toActionResult } from "@/lib/action";
import { LOCALES } from "@/lib/i18n/config";
import { writeAudit } from "@/server/audit";
import { requireAdmin } from "@/server/guards";

import { SECTION_KEYS } from "./schemas";
import { siteContentService } from "./service";

const target = { section: z.enum(SECTION_KEYS), locale: z.enum(LOCALES) };
const saveInput = z.object({ ...target, data: z.unknown() });
const resetInput = z.object(target);

// Navbar/footer ada di layout marketing, jadi seluruh halaman publik ikut diperbarui.
const refreshPublicPages = () => revalidatePath("/", "layout");

export async function saveSectionAction(input: unknown) {
  return toActionResult(async () => {
    const session = await requireAdmin();
    const { section, locale, data } = saveInput.parse(input);
    await siteContentService.save(session.user.id, section, locale, data);
    await writeAudit(session.user.id, "landing.save", `${section}:${locale}`);
    refreshPublicPages();
  });
}

export async function resetSectionAction(input: unknown) {
  return toActionResult(async () => {
    const session = await requireAdmin();
    const { section, locale } = resetInput.parse(input);
    await siteContentService.reset(section, locale);
    await writeAudit(session.user.id, "landing.reset", `${section}:${locale}`);
    refreshPublicPages();
  });
}
