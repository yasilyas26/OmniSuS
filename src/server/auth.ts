import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/env";
import { db } from "@/server/db/client";
import * as schema from "@/server/db/schema";

const MIN_PASSWORD_LENGTH = 8;

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  // Pembatasan percobaan dilakukan sendiri di database (server/rate-limit.ts); limiter bawaan
  // berbasis memori per instance sehingga tidak andal di serverless dan menimbulkan dua aturan.
  rateLimit: { enabled: false },
  emailAndPassword: { enabled: true, minPasswordLength: MIN_PASSWORD_LENGTH },
  user: {
    additionalFields: {
      // `input: false`: klien tidak bisa menyetel field ini lewat sign-up atau update profil.
      isAdmin: { type: "boolean", defaultValue: false, input: false },
    },
  },
  // Harus terakhir: menulis cookie sesi dari Server Action.
  plugins: [nextCookies()],
});
