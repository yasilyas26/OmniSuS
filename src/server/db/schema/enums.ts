import { pgEnum } from "drizzle-orm/pg-core";

export const businessSectorEnum = pgEnum("business_sector", [
  "KULINER",
  "FASHION",
  "KRIYA",
  "JASA",
  "PERDAGANGAN",
  "LAINNYA",
]);

export const memberRoleEnum = pgEnum("member_role", ["OWNER", "EMPLOYEE"]);
export const memberStatusEnum = pgEnum("member_status", ["ACTIVE", "DISABLED"]);

export const questionTypeEnum = pgEnum("question_type", ["LIKERT", "BOOLEAN", "CHOICE"]);
export const polarityEnum = pgEnum("polarity", ["POSITIVE", "NEGATIVE"]);

export const assessmentStatusEnum = pgEnum("assessment_status", ["OPEN", "CLOSED"]);
export const responseStatusEnum = pgEnum("response_status", ["DRAFT", "SUBMITTED"]);

export const resultCategoryEnum = pgEnum("result_category", ["HEALTHY", "FAIR", "AT_RISK"]);
