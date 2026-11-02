"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";

import { toActionResult } from "@/lib/action";
import { AppError } from "@/lib/errors";
import { auth } from "@/server/auth";
import { RATE_RULES, clientIp, consumeRateLimit, resetRateLimit } from "@/server/rate-limit";

import { loginSchema, registerSchema } from "./schemas";

export async function registerAction(input: unknown) {
  return toActionResult(async () => {
    const { name, email, password } = registerSchema.parse(input);
    const data = { name, email, password };
    await consumeRateLimit(RATE_RULES.registerIp, await clientIp());
    try {
      await auth.api.signUpEmail({ body: data });
    } catch (error) {
      if (error instanceof APIError) {
        throw new AppError("CONFLICT", "Pendaftaran gagal. Periksa data atau coba email lain.");
      }
      throw error;
    }
  });
}

export async function loginAction(input: unknown) {
  return toActionResult(async () => {
    const data = loginSchema.parse(input);
    const email = data.email.toLowerCase();
    await consumeRateLimit(RATE_RULES.loginIp, await clientIp());
    await consumeRateLimit(RATE_RULES.loginEmail, email);
    try {
      await auth.api.signInEmail({ body: data });
      await resetRateLimit(RATE_RULES.loginEmail, email);
    } catch (error) {
      // Pesan sama untuk "email tidak ada" dan "kata sandi salah" (hindari enumerasi akun).
      if (error instanceof APIError) {
        throw new AppError("UNAUTHORIZED", "Email atau kata sandi salah.");
      }
      throw error;
    }
  });
}

export async function logoutAction() {
  return toActionResult(async () => {
    await auth.api.signOut({ headers: await headers() });
  });
}
