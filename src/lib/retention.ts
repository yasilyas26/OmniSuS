/** Masa tenggang soft delete UMKM sebelum dihapus permanen (DATABASE.md §4). */
export const DELETION_GRACE_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function purgeDate(deletedAt: Date): Date {
  return new Date(deletedAt.getTime() + DELETION_GRACE_DAYS * MS_PER_DAY);
}

/** Sisa hari sebelum hard delete otomatis (minimal 0). */
export function daysUntilPurge(deletedAt: Date, now = new Date()): number {
  return Math.max(0, Math.ceil((purgeDate(deletedAt).getTime() - now.getTime()) / MS_PER_DAY));
}
