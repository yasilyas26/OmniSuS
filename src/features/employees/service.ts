import { APIError } from "better-auth/api";
import "server-only";

import { env } from "@/env";
import { AppError } from "@/lib/errors";
import { generateToken, hashToken } from "@/lib/token";
import { auth } from "@/server/auth";
import { db } from "@/server/db/client";
import type { Member } from "@/server/member";

import {
  claimInvitation,
  deleteInvitationForBusiness,
  deletePendingInvitationsForEmail,
  deleteUserById,
  findBusinessNameById,
  findInvitationByTokenHash,
  findUserIdByEmail,
  insertEmployeeMembership,
  insertInvitation,
  listEmployeesForBusiness,
  listPendingInvitationsForBusiness,
  releaseInvitation,
  updateEmployeeStatusForBusiness,
} from "./repository";
import { INVITE_TTL_DAYS } from "./schemas";
import type { AcceptInvitationInput, InviteEmployeeInput } from "./schemas";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const INVALID_INVITATION = "Tautan undangan tidak valid atau sudah kedaluwarsa.";

function assertOwner(member: Member) {
  if (member.role !== "OWNER") {
    throw new AppError("FORBIDDEN", "Hanya pemilik yang dapat mengelola karyawan.");
  }
}

async function findUsableInvitation(token: string) {
  const invitation = await findInvitationByTokenHash(hashToken(token));
  if (!invitation || invitation.acceptedAt || invitation.expiresAt.getTime() < Date.now()) {
    return undefined;
  }
  return invitation;
}

export const employeesService = {
  /** Daftar karyawan dan undangan menunggu. Sengaja tanpa info siapa yang sudah mengisi survei. */
  async list(member: Member) {
    assertOwner(member);
    const [employees, pendingInvitations] = await Promise.all([
      listEmployeesForBusiness(member.businessId),
      listPendingInvitationsForBusiness(member.businessId),
    ]);
    const now = Date.now();
    return {
      employees,
      pendingInvitations: pendingInvitations.map((invitation) => ({
        ...invitation,
        expired: invitation.expiresAt.getTime() < now,
      })),
    };
  },

  async invite(member: Member, input: InviteEmployeeInput) {
    assertOwner(member);
    if (await findUserIdByEmail(input.email)) {
      throw new AppError("CONFLICT", "Email ini sudah terdaftar di OmniSUS.");
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * MS_PER_DAY);
    await db.transaction(async (tx) => {
      await deletePendingInvitationsForEmail(tx, member.businessId, input.email);
      await insertInvitation(tx, {
        businessId: member.businessId,
        email: input.email,
        name: input.name,
        tokenHash: hashToken(token),
        expiresAt,
        createdBy: member.userId,
      });
    });

    // Token mentah hanya dikembalikan di sini; yang tersimpan hanya hash-nya.
    return { inviteUrl: `${env.APP_URL}/undangan/${token}`, expiresAt };
  },

  async cancelInvitation(member: Member, invitationId: string) {
    assertOwner(member);
    const deleted = await deleteInvitationForBusiness(invitationId, member.businessId);
    if (!deleted) throw new AppError("NOT_FOUND", "Undangan tidak ditemukan.");
  },

  async setStatus(member: Member, membershipId: string, status: "ACTIVE" | "DISABLED") {
    assertOwner(member);
    const updated = await updateEmployeeStatusForBusiness(membershipId, member.businessId, status);
    if (!updated) throw new AppError("NOT_FOUND", "Karyawan tidak ditemukan.");
  },

  /** Untuk halaman undangan: tampilkan konteks tanpa membuka rahasia apa pun. */
  async getInvitationPreview(token: string) {
    const invitation = await findUsableInvitation(token);
    if (!invitation) return null;
    const businessName = await findBusinessNameById(invitation.businessId);
    return { businessName: businessName ?? "UMKM", name: invitation.name, email: invitation.email };
  },

  /**
   * Karyawan menetapkan kata sandinya sendiri; pemilik tidak pernah menentukannya (CLAUDE.md aturan 4).
   * Token diklaim dulu secara atomik, dan klaim dilepas bila pembuatan akun gagal.
   */
  async acceptInvitation(input: AcceptInvitationInput) {
    const invitation = await findUsableInvitation(input.token);
    if (!invitation || !(await claimInvitation(invitation.id))) {
      throw new AppError("NOT_FOUND", INVALID_INVITATION);
    }

    let userId: string | undefined;
    try {
      const created = await auth.api.signUpEmail({
        body: { name: invitation.name, email: invitation.email, password: input.password },
      });
      userId = created.user.id;
      await insertEmployeeMembership(db, userId, invitation.businessId);
    } catch (error) {
      await releaseInvitation(invitation.id);
      if (userId) await deleteUserById(userId);
      if (error instanceof APIError) {
        throw new AppError("CONFLICT", "Akun dengan email undangan ini tidak dapat dibuat.");
      }
      throw error;
    }
  },
};
