import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";

import { AppError } from "@/lib/errors";
import { auth } from "@/server/auth";
import type { Member, MemberRole } from "@/server/member";
import { findMembershipByUserId } from "@/server/membership";

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/masuk");
  return session;
}

/** Membership aktif dari sesi. Dicek di setiap request, bukan hanya saat login (SECURITY T7). */
export async function requireMembership(): Promise<Member> {
  const session = await requireSession();
  const membership = await findMembershipByUserId(session.user.id);
  // Admin platform tidak wajib punya UMKM; arahkan ke dashboard admin.
  if (!membership) redirect(session.user.isAdmin ? "/admin" : "/onboarding");
  if (membership.businessDeleted) redirect("/umkm-dihapus");
  if (membership.status !== "ACTIVE") redirect("/masuk?nonaktif=1");
  return { userId: membership.userId, businessId: membership.businessId, role: membership.role };
}

/** Halaman onboarding: butuh sesi tetapi belum punya UMKM; yang sudah punya diarahkan ke dashboard. */
export async function requireOnboarding() {
  const session = await requireSession();
  if (await findMembershipByUserId(session.user.id)) redirect("/dashboard");
  return session;
}

/** Untuk Server Action: melempar FORBIDDEN (menjadi ActionResult) jika peran tidak cocok. */
export async function requireRole(role: MemberRole): Promise<Member> {
  const member = await requireMembership();
  if (member.role !== role) throw new AppError("FORBIDDEN", "Anda tidak memiliki akses.");
  return member;
}

/** Untuk halaman: peran tidak cocok → 404, supaya keberadaan rute tidak dibocorkan. */
export async function requireRolePage(role: MemberRole): Promise<Member> {
  const member = await requireMembership();
  if (member.role !== role) notFound();
  return member;
}

/** Untuk Server Action admin: peran platform, terpisah dari peran UMKM. Dicek ke DB di setiap request. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user.isAdmin) throw new AppError("FORBIDDEN", "Anda tidak memiliki akses admin.");
  return session;
}

/** Untuk halaman admin: bukan admin → 404 agar keberadaan rute tidak dibocorkan. */
export async function requireAdminPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");
  if (!session.user.isAdmin) notFound();
  return session;
}

/** Halaman tamu (masuk/daftar): pengguna yang sudah punya sesi diarahkan ke tempatnya. */
export async function requireGuest() {
  const session = await getSession();
  if (!session) return;
  const membership = await findMembershipByUserId(session.user.id);
  if (!membership) redirect(session.user.isAdmin ? "/admin" : "/onboarding");
  if (membership.status === "ACTIVE") redirect("/dashboard");
}
