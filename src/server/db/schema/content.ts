import { jsonb, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { user } from "./auth";

// Konten landing page yang dapat diubah admin: satu baris per (section, bahasa). Isi divalidasi Zod
// saat disimpan dan saat dibaca; jika belum ada baris, aplikasi memakai teks bawaan di kode.
export const siteContent = pgTable(
  "site_content",
  {
    section: varchar("section", { length: 40 }).notNull(),
    locale: varchar("locale", { length: 5 }).notNull().default("id"),
    data: jsonb("data").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  },
  (table) => [primaryKey({ columns: [table.section, table.locale] })],
);
