"use server";

import { revalidatePath } from "next/cache";

import { toActionResult } from "@/lib/action";
import { requireRole } from "@/server/guards";

import { closeAssessmentSchema, openAssessmentSchema } from "./schemas";
import { assessmentsService } from "./service";

export async function openAssessmentAction(input: unknown) {
  return toActionResult(async () => {
    const member = await requireRole("OWNER");
    const data = openAssessmentSchema.parse(input);
    const assessment = await assessmentsService.open(member, data);
    revalidatePath("/penilaian");
    revalidatePath("/dashboard");
    return assessment;
  });
}

export async function closeAssessmentAction(input: unknown) {
  return toActionResult(async () => {
    const member = await requireRole("OWNER");
    const data = closeAssessmentSchema.parse(input);
    await assessmentsService.close(member, data);
    revalidatePath("/penilaian");
    revalidatePath("/dashboard");
    // Statistik landing berubah hanya saat periode ditutup (ADR-006).
    revalidatePath("/");
  });
}
