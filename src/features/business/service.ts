import "server-only";

import { AppError } from "@/lib/errors";
import { writeAudit } from "@/server/audit";
import { db } from "@/server/db/client";
import type { Member } from "@/server/member";
import { findMembershipByUserId } from "@/server/membership";

import {
  findBusinessById,
  insertBusiness,
  insertOwnerMembership,
  listBusinessesForAdmin,
  setBusinessDeletedAt,
  updateBusinessById,
} from "./repository";
import type { BusinessProfileInput } from "./schemas";

const DELETE_MISMATCH = "Nama usaha yang diketik tidak sama.";

export const businessService = {
  async getProfile(member: Member) {
    const business = await findBusinessById(member.businessId);
    if (!business) throw new AppError("NOT_FOUND", "UMKM tidak ditemukan.");
    return business;
  },

  async createWithOwner(userId: string, input: BusinessProfileInput) {
    const existing = await findMembershipByUserId(userId);
    if (existing) throw new AppError("CONFLICT", "Akun ini sudah terhubung ke sebuah UMKM.");

    return db.transaction(async (tx) => {
      const business = await insertBusiness(tx, input);
      await insertOwnerMembership(tx, userId, business.id);
      return { businessId: business.id };
    });
  },

  async updateProfile(member: Member, input: BusinessProfileInput) {
    if (member.role !== "OWNER")
      throw new AppError("FORBIDDEN", "Hanya pemilik yang dapat mengubah profil UMKM.");
    await updateBusinessById(member.businessId, input);
  },

  /** Soft delete (DATABASE.md §4): dikonfirmasi dengan mengetik nama usaha; admin bisa memulihkan. */
  async softDelete(member: Member, confirmName: string) {
    if (member.role !== "OWNER")
      throw new AppError("FORBIDDEN", "Hanya pemilik yang dapat menghapus UMKM.");
    const business = await findBusinessById(member.businessId);
    if (!business) throw new AppError("NOT_FOUND", "UMKM tidak ditemukan.");
    if (business.name.trim().toLowerCase() !== confirmName.trim().toLowerCase())
      throw new AppError("VALIDATION", DELETE_MISMATCH);
    await setBusinessDeletedAt(member.businessId, new Date());
    await writeAudit(member.userId, "business.soft_delete", member.businessId);
  },

  async listForAdmin() {
    return listBusinessesForAdmin();
  },

  async restore(adminUserId: string, businessId: string) {
    const restored = await setBusinessDeletedAt(businessId, null);
    if (!restored) throw new AppError("NOT_FOUND", "UMKM tidak ditemukan.");
    await writeAudit(adminUserId, "business.restore", businessId);
  },
};
