import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

// Penghitung rate limit per kunci (hash, bukan email/IP mentah) dalam jendela waktu tetap.
export const rateLimits = pgTable("rate_limits", {
  key: varchar("key", { length: 100 }).primaryKey(),
  count: integer("count").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});

// Riwayat perubahan oleh admin / penghapusan data. `detail` hanya metadata (tanpa jawaban,
// kata sandi, token); lihat SECURITY.md §7.
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    action: varchar("action", { length: 60 }).notNull(),
    target: varchar("target", { length: 120 }),
    detail: jsonb("detail"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("audit_logs_created_idx").on(table.createdAt)],
);
