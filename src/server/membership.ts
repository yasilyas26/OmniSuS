import { eq, isNotNull } from "drizzle-orm";
import "server-only";

import { db } from "@/server/db/client";
import { businesses, memberships } from "@/server/db/schema";

/** Dipakai guards dan fitur business; satu-satunya jalur baca membership berdasarkan user. */
export async function findMembershipByUserId(userId: string) {
  const [row] = await db
    .select({
      userId: memberships.userId,
      businessId: memberships.businessId,
      role: memberships.role,
      status: memberships.status,
      businessDeleted: isNotNull(businesses.deletedAt),
    })
    .from(memberships)
    .innerJoin(businesses, eq(businesses.id, memberships.businessId))
    .where(eq(memberships.userId, userId));
  return row;
}
