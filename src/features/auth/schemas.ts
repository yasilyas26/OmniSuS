import { z } from "zod";

import { passwordSchema } from "@/lib/password";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Format email tidak valid."));

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(120),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Isi kata sandi."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
