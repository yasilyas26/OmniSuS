import { desc, eq } from "drizzle-orm";
import "server-only";

import { type DbOrTx, db } from "@/server/db/client";
import { businesses, memberships } from "@/server/db/schema";

import type { BusinessProfileInput } from "./schemas";

export async function insertBusiness(exec: DbOrTx, input: BusinessProfileInput) {
  const [row] = await exec.insert(businesses).values(input).returning();
  if (!row) throw new Error("Gagal menyimpan UMKM");
  return row;
}

export async function insertOwnerMembership(exec: DbOrTx, userId: string, businessId: string) {
  await exec.insert(memberships).values({ userId, businessId, role: "OWNER" });
}

/** `businessId` di sini adalah id tenant itu sendiri, selalu berasal dari sesi. */
export async function findBusinessById(businessId: string) {
  const [row] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  return row;
}

export async function updateBusinessById(businessId: string, input: BusinessProfileInput) {
  await db.update(businesses).set(input).where(eq(businesses.id, businessId));
}

export async function setBusinessDeletedAt(businessId: string, deletedAt: Date | null) {
  const rows = await db
    .update(businesses)
    .set({ deletedAt })
    .where(eq(businesses.id, businessId))
    .returning({ id: businesses.id });
  return rows.length > 0;
}

/** Hanya untuk dashboard admin: semua UMKM beserta jumlah anggota, termasuk yang soft-deleted. */
export async function listBusinessesForAdmin() {
  return db
    .select({
      id: businesses.id,
      name: businesses.name,
      sector: businesses.sector,
      city: businesses.city,
      isDemo: businesses.isDemo,
      createdAt: businesses.createdAt,
      deletedAt: businesses.deletedAt,
    })
    .from(businesses)
    .orderBy(desc(businesses.createdAt));
}
