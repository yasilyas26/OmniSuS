import { z } from "zod";

import { passwordSchema } from "@/lib/password";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Format email tidak valid."));

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nama terlalu pendek (min. 2 karakter).").max(120),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Ulangi kata sandi di sini."),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi tidak cocok.",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Isi kata sandi."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
