"use server";

import { revalidatePath } from "next/cache";

import { toActionResult } from "@/lib/action";
import { requireRole } from "@/server/guards";
import { RATE_RULES, clientIp, consumeRateLimit } from "@/server/rate-limit";

import {
  acceptInvitationSchema,
  cancelInvitationSchema,
  inviteEmployeeSchema,
  setEmployeeStatusSchema,
} from "./schemas";
import { employeesService } from "./service";

export async function inviteEmployeeAction(input: unknown) {
  return toActionResult(async () => {
    const member = await requireRole("OWNER");
    const data = inviteEmployeeSchema.parse(input);
    const invitation = await employeesService.invite(member, data);
    revalidatePath("/karyawan");
    return invitation;
  });
}

export async function cancelInvitationAction(input: unknown) {
  return toActionResult(async () => {
    const member = await requireRole("OWNER");
    const { invitationId } = cancelInvitationSchema.parse(input);
    await employeesService.cancelInvitation(member, invitationId);
    revalidatePath("/karyawan");
  });
}

export async function setEmployeeStatusAction(input: unknown) {
  return toActionResult(async () => {
    const member = await requireRole("OWNER");
    const { membershipId, status } = setEmployeeStatusSchema.parse(input);
    await employeesService.setStatus(member, membershipId, status);
    revalidatePath("/karyawan");
  });
}

/** Tanpa guard sesi: penerima undangan belum punya akun. Aksesnya dijaga oleh token. */
export async function acceptInvitationAction(input: unknown) {
  return toActionResult(async () => {
    const data = acceptInvitationSchema.parse(input);
    await consumeRateLimit(RATE_RULES.invitationIp, await clientIp());
    await employeesService.acceptInvitation(data);
  });
}
