import {
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { assessments } from "./assessments";
import { resultCategoryEnum } from "./enums";
import { dimensions } from "./instruments";

// Snapshot: ditulis sekali saat periode ditutup, tidak pernah diubah (ADR-003).
export const assessmentResults = pgTable("assessment_results", {
  assessmentId: uuid("assessment_id")
    .primaryKey()
    .references(() => assessments.id, { onDelete: "cascade" }),
  ownerScore: numeric("owner_score", { precision: 5, scale: 2 }).notNull(),
  // null jika responden karyawan < minimum.
  employeeScore: numeric("employee_score", { precision: 5, scale: 2 }),
  employeeRespondents: integer("employee_respondents").notNull(),
  combinedScore: numeric("combined_score", { precision: 5, scale: 2 }).notNull(),
  category: resultCategoryEnum("category").notNull(),
  scoringVersion: varchar("scoring_version", { length: 40 }).notNull(),
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dimensionResults = pgTable(
  "dimension_results",
  {
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    dimensionId: uuid("dimension_id")
      .notNull()
      .references(() => dimensions.id),
    // null jika seluruh butir faktor dijawab "Tidak berlaku".
    ownerScore: numeric("owner_score", { precision: 5, scale: 2 }),
    employeeScore: numeric("employee_score", { precision: 5, scale: 2 }),
    // owner − karyawan; hanya untuk faktor is_shared.
    gap: numeric("gap", { precision: 5, scale: 2 }),
  },
  (table) => [primaryKey({ columns: [table.assessmentId, table.dimensionId] })],
);

// Snapshot butir cross-check (nilai owner vs rata-rata karyawan). Disimpan agar halaman hasil
// tidak perlu membaca jawaban per karyawan (aturan 3). employee_mean null jika responden < minimum.
export const crossCheckResults = pgTable(
  "cross_check_results",
  {
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    pairKey: varchar("pair_key", { length: 60 }).notNull(),
    statement: text("statement").notNull(),
    ownerValue: integer("owner_value"),
    employeeMean: numeric("employee_mean", { precision: 4, scale: 2 }),
  },
  (table) => [primaryKey({ columns: [table.assessmentId, table.pairKey] })],
);
