import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import "server-only";

import { AppError } from "@/lib/errors";
import { hashToken } from "@/lib/token";
import { db } from "@/server/db/client";
import { rateLimits } from "@/server/db/schema";

const MS_PER_SECOND = 1000;

export type RateLimitRule = { scope: string; max: number; windowSeconds: number };

/** Aturan SECURITY.md §6. Batas IP longgar agar kantor/kampus berbagi IP tetap bisa dipakai. */
export const RATE_RULES = {
  loginEmail: { scope: "login-email", max: 10, windowSeconds: 15 * 60 },
  loginIp: { scope: "login-ip", max: 200, windowSeconds: 15 * 60 },
  registerIp: { scope: "register-ip", max: 60, windowSeconds: 60 * 60 },
  invitationIp: { scope: "invite-ip", max: 60, windowSeconds: 15 * 60 },
} as const satisfies Record<string, RateLimitRule>;

/** IP klien dari header proxy; "unknown" bila tidak ada (tetap dibatasi sebagai satu ember). */
export async function clientIp() {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
}

/**
 * Hitung satu percobaan pada jendela tetap (atomik di DB, jadi andal di serverless).
 * Kunci di-hash agar email/IP mentah tidak tersimpan. Melempar RULE_VIOLATION jika melebihi batas.
 */
export async function consumeRateLimit(rule: RateLimitRule, subject: string) {
  const key = hashToken(`${rule.scope}:${subject}`);
  const windowMs = rule.windowSeconds * MS_PER_SECOND;
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.windowStart} < now() - ${windowMs} * interval '1 millisecond' then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${rateLimits.windowStart} < now() - ${windowMs} * interval '1 millisecond' then now() else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count });

  if ((row?.count ?? 0) > rule.max) {
    throw new AppError("RATE_LIMITED", "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.");
  }
}

/** Setelah login berhasil, hitungan email dikosongkan agar pengguna sah tidak terkunci. */
export async function resetRateLimit(rule: RateLimitRule, subject: string) {
  await db
    .delete(rateLimits)
    .where(sql`${rateLimits.key} = ${hashToken(`${rule.scope}:${subject}`)}`);
}
