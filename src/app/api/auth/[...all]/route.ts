import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors";
import { auth } from "@/server/auth";
import { RATE_RULES, clientIp, consumeRateLimit } from "@/server/rate-limit";

const handler = toNextJsHandler(auth);

export const { GET } = handler;

/**
 * Endpoint Better Auth bisa dipanggil langsung (tanpa lewat Server Action), jadi sign-in dan
 * sign-up dibatasi di sini juga; aturan yang sama dengan action (SECURITY.md §6).
 */
export async function POST(request: Request) {
  const { pathname } = new URL(request.url);
  try {
    if (pathname.endsWith("/sign-in/email")) {
      await consumeRateLimit(RATE_RULES.loginIp, await clientIp());
      const body: unknown = await request
        .clone()
        .json()
        .catch(() => null);
      const email =
        body && typeof body === "object" && "email" in body && typeof body.email === "string"
          ? body.email.toLowerCase()
          : null;
      if (email) await consumeRateLimit(RATE_RULES.loginEmail, email);
    } else if (pathname.endsWith("/sign-up/email")) {
      await consumeRateLimit(RATE_RULES.registerIp, await clientIp());
    }
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message }, { status: 429 });
    }
    throw error;
  }
  return handler.POST(request);
}
