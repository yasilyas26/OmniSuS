"use server";

import { revalidatePath } from "next/cache";

import { toActionResult } from "@/lib/action";
import { requireAdmin, requireRole, requireSession } from "@/server/guards";

import { businessProfileSchema, deleteBusinessSchema, restoreBusinessSchema } from "./schemas";
import { businessService } from "./service";

export async function createBusinessAction(input: unknown) {
  return toActionResult(async () => {
    const session = await requireSession();
    const data = businessProfileSchema.parse(input);
    return businessService.createWithOwner(session.user.id, data);
  });
}

export async function updateBusinessAction(input: unknown) {
  return toActionResult(async () => {
    const member = await requireRole("OWNER");
    const data = businessProfileSchema.parse(input);
    await businessService.updateProfile(member, data);
    revalidatePath("/umkm");
  });
}

export async function deleteBusinessAction(input: unknown) {
  return toActionResult(async () => {
    const member = await requireRole("OWNER");
    const data = deleteBusinessSchema.parse(input);
    await businessService.softDelete(member, data.confirmName);
    // Statistik publik tidak boleh lagi memuat UMKM ini.
    revalidatePath("/", "layout");
  });
}

export async function restoreBusinessAction(input: unknown) {
  return toActionResult(async () => {
    const session = await requireAdmin();
    const data = restoreBusinessSchema.parse(input);
    await businessService.restore(session.user.id, data.businessId);
    revalidatePath("/admin/umkm");
    revalidatePath("/", "layout");
  });
}
