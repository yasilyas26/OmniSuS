"use server";

import { revalidatePath } from "next/cache";

import { toActionResult } from "@/lib/action";
import { requireMembership } from "@/server/guards";

import { submitSurveySchema } from "./schemas";
import { surveyService } from "./service";

/** Dipakai untuk simpan draf (`final: false`) maupun kirim final (`final: true`). */
export async function saveSurveyAction(input: unknown) {
  return toActionResult(async () => {
    const member = await requireMembership();
    const data = submitSurveySchema.parse(input);
    await surveyService.save(member, data);
    if (data.final) {
      revalidatePath("/dashboard");
      revalidatePath("/penilaian");
    }
  });
}
