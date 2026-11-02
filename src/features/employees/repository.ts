import { and, asc, eq, isNull } from "drizzle-orm";
import "server-only";

import { type DbOrTx, db } from "@/server/db/client";
import { businesses, invitations, memberships, user } from "@/server/db/schema";

type NewInvitation = {
  businessId: string;
  email: string;
  name: string;
  tokenHash: string;
  expiresAt: Date;
  createdBy: string;
};

export async function findUserIdByEmail(email: string) {
  const [row] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  return row?.id;
}

export async function deleteUserById(userId: string) {
  await db.delete(user).where(eq(user.id, userId));
}

/** Satu undangan aktif per (bisnis, email): undangan lama diganti saat diundang ulang. */
export async function deletePendingInvitationsForEmail(
  exec: DbOrTx,
  businessId: string,
  email: string,
) {
  await exec
    .delete(invitations)
    .where(
      and(
        eq(invitations.businessId, businessId),
        eq(invitations.email, email),
        isNull(invitations.acceptedAt),
      ),
    );
}

export async function insertInvitation(exec: DbOrTx, values: NewInvitation) {
  await exec.insert(invitations).values(values);
}

export async function deleteInvitationForBusiness(invitationId: string, businessId: string) {
  const rows = await db
    .delete(invitations)
    .where(
      and(
        eq(invitations.id, invitationId),
        eq(invitations.businessId, businessId),
        isNull(invitations.acceptedAt),
      ),
    )
    .returning({ id: invitations.id });
  return rows.length > 0;
}

export async function listPendingInvitationsForBusiness(businessId: string) {
  return db
    .select({
      id: invitations.id,
      name: invitations.name,
      email: invitations.email,
      expiresAt: invitations.expiresAt,
    })
    .from(invitations)
    .where(and(eq(invitations.businessId, businessId), isNull(invitations.acceptedAt)))
    .orderBy(asc(invitations.createdAt));
}

export async function listEmployeesForBusiness(businessId: string) {
  return db
    .select({
      membershipId: memberships.id,
      name: user.name,
      email: user.email,
      status: memberships.status,
      joinedAt: memberships.createdAt,
    })
    .from(memberships)
    .innerJoin(user, eq(user.id, memberships.userId))
    .where(and(eq(memberships.businessId, businessId), eq(memberships.role, "EMPLOYEE")))
    .orderBy(asc(memberships.createdAt));
}

export async function updateEmployeeStatusForBusiness(
  membershipId: string,
  businessId: string,
  status: "ACTIVE" | "DISABLED",
) {
  const rows = await db
    .update(memberships)
    .set({ status })
    .where(
      and(
        eq(memberships.id, membershipId),
        eq(memberships.businessId, businessId),
        eq(memberships.role, "EMPLOYEE"),
      ),
    )
    .returning({ id: memberships.id });
  return rows.length > 0;
}

/** Pencarian lewat hash token: token itu sendiri adalah rahasia, jadi tidak di-scope tenant. */
export async function findInvitationByTokenHash(tokenHash: string) {
  const [row] = await db.select().from(invitations).where(eq(invitations.tokenHash, tokenHash));
  return row;
}

export async function findBusinessNameById(businessId: string) {
  const [row] = await db
    .select({ name: businesses.name })
    .from(businesses)
    .where(eq(businesses.id, businessId));
  return row?.name;
}

/** Klaim atomik supaya token tidak bisa dipakai dua kali walau diakses bersamaan. */
export async function claimInvitation(invitationId: string) {
  const [row] = await db
    .update(invitations)
    .set({ acceptedAt: new Date() })
    .where(and(eq(invitations.id, invitationId), isNull(invitations.acceptedAt)))
    .returning({ id: invitations.id });
  return row !== undefined;
}

export async function releaseInvitation(invitationId: string) {
  await db.update(invitations).set({ acceptedAt: null }).where(eq(invitations.id, invitationId));
}

export async function insertEmployeeMembership(exec: DbOrTx, userId: string, businessId: string) {
  await exec.insert(memberships).values({ userId, businessId, role: "EMPLOYEE" });
}
