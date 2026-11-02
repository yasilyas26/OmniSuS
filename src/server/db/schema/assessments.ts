import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { businesses } from "./businesses";
import { assessmentStatusEnum, responseStatusEnum } from "./enums";
import { instruments, questionOptions, questions } from "./instruments";

export const assessments = pgTable(
  "assessments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 80 }).notNull(),
    status: assessmentStatusEnum("status").notNull().default("OPEN"),
    openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => [
    // Maksimal satu periode terbuka per UMKM.
    uniqueIndex("assessments_one_open_per_business_uq")
      .on(table.businessId)
      .where(sql`${table.status} = 'OPEN'`),
  ],
);

export const responses = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    // Versi instrumen yang dipakai saat mengisi.
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: responseStatusEnum("status").notNull().default("DRAFT"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("responses_assessment_user_uq").on(table.assessmentId, table.userId)],
);

export const answers = pgTable(
  "answers",
  {
    responseId: uuid("response_id")
      .notNull()
      .references(() => responses.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),
    likertValue: smallint("likert_value"),
    boolValue: boolean("bool_value"),
    optionId: uuid("option_id").references(() => questionOptions.id),
    isNotApplicable: boolean("is_not_applicable").notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.responseId, table.questionId] }),
    check(
      "answers_likert_range_ck",
      sql`${table.likertValue} is null or ${table.likertValue} between 1 and 5`,
    ),
    // Tepat satu bentuk jawaban terisi. Kecocokan dengan questions.type dicek di service.
    check(
      "answers_exactly_one_value_ck",
      sql`(${table.likertValue} is not null)::int
        + (${table.boolValue} is not null)::int
        + (${table.optionId} is not null)::int
        + (${table.isNotApplicable})::int = 1`,
    ),
  ],
);
