import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { memberRoleEnum, polarityEnum, questionTypeEnum } from "./enums";

export const dimensions = pgTable("dimensions", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  // Terjemahan Inggris untuk situs publik; null = pakai teks Indonesia.
  nameEn: varchar("name_en", { length: 120 }),
  descriptionEn: text("description_en"),
  // true = diisi owner & karyawan, sehingga gap dihitung.
  isShared: boolean("is_shared").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const instruments = pgTable(
  "instruments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 40 }).notNull().unique(),
    targetRole: memberRoleEnum("target_role").notNull(),
    version: integer("version").notNull(),
    scaleMin: integer("scale_min").notNull(),
    scaleMax: integer("scale_max").notNull(),
    isActive: boolean("is_active").notNull().default(false),
  },
  (table) => [
    uniqueIndex("instruments_one_active_per_role_uq")
      .on(table.targetRole)
      .where(sql`${table.isActive} = true`),
  ],
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 40 }).notNull(),
    type: questionTypeEnum("type").notNull(),
    // null untuk butir profil dan cross-check.
    dimensionId: uuid("dimension_id").references(() => dimensions.id),
    text: text("text").notNull(),
    polarity: polarityEnum("polarity"),
    allowNotApplicable: boolean("allow_not_applicable").notNull().default(false),
    pairKey: varchar("pair_key", { length: 60 }),
    weight: numeric("weight").notNull().default("1"),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [
    uniqueIndex("questions_instrument_key_uq").on(table.instrumentId, table.key),
    check(
      "questions_likert_polarity_ck",
      sql`(${table.type} = 'LIKERT') = (${table.polarity} is not null)`,
    ),
  ],
);

export const questionOptions = pgTable("question_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 160 }).notNull(),
  sortOrder: integer("sort_order").notNull(),
});

// Opsional: jika kosong untuk satu instrumen, semua bobot faktor = 1.
export const dimensionWeights = pgTable(
  "dimension_weights",
  {
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    dimensionId: uuid("dimension_id")
      .notNull()
      .references(() => dimensions.id, { onDelete: "cascade" }),
    weight: numeric("weight").notNull().default("1"),
  },
  (table) => [primaryKey({ columns: [table.instrumentId, table.dimensionId] })],
);
