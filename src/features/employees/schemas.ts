import { z } from "zod";

import { passwordSchema } from "@/lib/password";

export const INVITE_TTL_DAYS = 7;

export const inviteEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(120),
  email: z.string().trim().toLowerCase().pipe(z.email("Format email tidak valid.")),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const setEmployeeStatusSchema = z.object({
  membershipId: z.uuid(),
  status: z.enum(["ACTIVE", "DISABLED"]),
});

export const cancelInvitationSchema = z.object({ invitationId: z.uuid() });

export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
