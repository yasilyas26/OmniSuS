import { and, eq, inArray, isNotNull, lt } from "drizzle-orm";

import { DELETION_GRACE_DAYS, purgeDate } from "../../../lib/retention";
import { db } from "../client";
import { auditLogs, businesses, memberships, user } from "../schema";

// Pemakaian:
//   pnpm data:purge                       hapus permanen UMKM yang soft-deleted lewat masa tenggang
//   pnpm data:purge --business <id>       hapus permanen SEKARANG satu UMKM (permintaan penghapusan data)
//   tambahkan --dry-run untuk hanya melihat apa yang akan dihapus
// Hard delete tidak bisa dibatalkan (DATABASE.md §4). Hanya dijalankan dari komputer yang memegang DATABASE_URL.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

async function findTargets(businessId: string | undefined) {
  if (businessId) {
    return db
      .select({ id: businesses.id, name: businesses.name, deletedAt: businesses.deletedAt })
      .from(businesses)
      .where(eq(businesses.id, businessId));
  }
  const cutoff = new Date(Date.now() - DELETION_GRACE_DAYS * MS_PER_DAY);
  return db
    .select({ id: businesses.id, name: businesses.name, deletedAt: businesses.deletedAt })
    .from(businesses)
    .where(and(isNotNull(businesses.deletedAt), lt(businesses.deletedAt, cutoff)));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const flag = args.indexOf("--business");
  const businessId = flag >= 0 ? args[flag + 1] : undefined;
  if (flag >= 0 && !businessId) throw new Error("Pemakaian: --business <id>");

  const targets = await findTargets(businessId);
  if (targets.length === 0) {
    console.log("Tidak ada UMKM yang perlu dihapus permanen.");
    process.exit(0);
  }

  for (const target of targets) {
    const when = target.deletedAt
      ? `soft-deleted, permanen ${purgeDate(target.deletedAt).toISOString()}`
      : "belum soft-deleted";
    console.log(`${dryRun ? "[dry-run] " : ""}${target.name} (${target.id}): ${when}`);
    if (dryRun) continue;

    await db.transaction(async (tx) => {
      const members = await tx
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(eq(memberships.businessId, target.id));
      // Cascade FK menghapus membership, undangan, periode, respons, jawaban, dan snapshot hasil.
      await tx.delete(businesses).where(eq(businesses.id, target.id));
      const userIds = members.map((member) => member.userId);
      if (userIds.length > 0) {
        // Akun admin platform tidak pernah ikut terhapus.
        await tx.delete(user).where(and(inArray(user.id, userIds), eq(user.isAdmin, false)));
      }
      await tx.insert(auditLogs).values({
        action: "business.hard_delete",
        target: target.id,
        detail: { members: userIds.length },
      });
    });
    console.log("  → dihapus permanen.");
  }
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
