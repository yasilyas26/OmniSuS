import { desc, eq } from "drizzle-orm";
import "server-only";

import { db } from "@/server/db/client";
import { auditLogs, user } from "@/server/db/schema";

/**
 * Catat perubahan penting. `detail` hanya metadata (kode/nama bagian/id), tidak pernah jawaban,
 * kata sandi, atau token (SECURITY.md §7). Kegagalan mencatat tidak boleh menggagalkan aksi utama.
 */
export async function writeAudit(
  actorId: string | null,
  action: string,
  target?: string,
  detail?: Record<string, string | number | boolean | null>,
) {
  try {
    await db.insert(auditLogs).values({ actorId, action, target, detail });
  } catch {
    console.error(JSON.stringify({ scope: "audit", code: "WRITE_FAILED", action }));
  }
}

export const AUDIT_LABELS: Record<string, string> = {
  "instrument.create_draft": "Membuat versi draf instrumen",
  "instrument.activate": "Mengaktifkan versi instrumen",
  "instrument.delete_draft": "Menghapus draf instrumen",
  "question.save": "Menyimpan butir",
  "question.delete": "Menghapus butir",
  "dimension.update": "Mengubah faktor",
  "landing.save": "Mengubah konten landing",
  "landing.reset": "Mengembalikan konten landing ke bawaan",
  "business.soft_delete": "UMKM dihapus (soft delete)",
  "business.restore": "UMKM dipulihkan",
  "business.hard_delete": "UMKM dihapus permanen (hard delete)",
};

export async function listRecentAudit(limit = 100) {
  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      target: auditLogs.target,
      createdAt: auditLogs.createdAt,
      actorName: user.name,
    })
    .from(auditLogs)
    .leftJoin(user, eq(user.id, auditLogs.actorId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
