CREATE TYPE "public"."assessment_status" AS ENUM('OPEN', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."business_sector" AS ENUM('KULINER', 'FASHION', 'KRIYA', 'JASA', 'PERDAGANGAN', 'LAINNYA');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('OWNER', 'EMPLOYEE');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('ACTIVE', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."polarity" AS ENUM('POSITIVE', 'NEGATIVE');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('LIKERT', 'BOOLEAN', 'CHOICE');--> statement-breakpoint
CREATE TYPE "public"."response_status" AS ENUM('DRAFT', 'SUBMITTED');--> statement-breakpoint
CREATE TYPE "public"."result_category" AS ENUM('HEALTHY', 'FAIR', 'AT_RISK');--> statement-breakpoint
CREATE TABLE "answers" (
	"response_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"likert_value" smallint,
	"bool_value" boolean,
	"option_id" uuid,
	"is_not_applicable" boolean DEFAULT false NOT NULL,
	CONSTRAINT "answers_response_id_question_id_pk" PRIMARY KEY("response_id","question_id"),
	CONSTRAINT "answers_likert_range_ck" CHECK ("answers"."likert_value" is null or "answers"."likert_value" between 1 and 5),
	CONSTRAINT "answers_exactly_one_value_ck" CHECK (("answers"."likert_value" is not null)::int
        + ("answers"."bool_value" is not null)::int
        + ("answers"."option_id" is not null)::int
        + ("answers"."is_not_applicable")::int = 1)
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"label" varchar(80) NOT NULL,
	"status" "assessment_status" DEFAULT 'OPEN' NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"instrument_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"status" "response_status" DEFAULT 'DRAFT' NOT NULL,
	"submitted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"sector" "business_sector" NOT NULL,
	"city" varchar(80) NOT NULL,
	"employee_count" integer NOT NULL,
	"founded_year" integer,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(120) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"business_id" uuid NOT NULL,
	"role" "member_role" NOT NULL,
	"status" "member_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "dimension_weights" (
	"instrument_id" uuid NOT NULL,
	"dimension_id" uuid NOT NULL,
	"weight" numeric DEFAULT '1' NOT NULL,
	CONSTRAINT "dimension_weights_instrument_id_dimension_id_pk" PRIMARY KEY("instrument_id","dimension_id")
);
--> statement-breakpoint
CREATE TABLE "dimensions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(60) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"is_shared" boolean NOT NULL,
	"sort_order" integer NOT NULL,
	CONSTRAINT "dimensions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "instruments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"target_role" "member_role" NOT NULL,
	"version" integer NOT NULL,
	"scale_min" integer NOT NULL,
	"scale_max" integer NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	CONSTRAINT "instruments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"label" varchar(160) NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" uuid NOT NULL,
	"key" varchar(40) NOT NULL,
	"type" "question_type" NOT NULL,
	"dimension_id" uuid,
	"text" text NOT NULL,
	"polarity" "polarity",
	"allow_not_applicable" boolean DEFAULT false NOT NULL,
	"pair_key" varchar(60),
	"weight" numeric DEFAULT '1' NOT NULL,
	"sort_order" integer NOT NULL,
	CONSTRAINT "questions_likert_polarity_ck" CHECK (("questions"."type" = 'LIKERT') = ("questions"."polarity" is not null))
);
--> statement-breakpoint
CREATE TABLE "assessment_results" (
	"assessment_id" uuid PRIMARY KEY NOT NULL,
	"owner_score" numeric(5, 2) NOT NULL,
	"employee_score" numeric(5, 2),
	"employee_respondents" integer NOT NULL,
	"combined_score" numeric(5, 2) NOT NULL,
	"category" "result_category" NOT NULL,
	"scoring_version" varchar(40) NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dimension_results" (
	"assessment_id" uuid NOT NULL,
	"dimension_id" uuid NOT NULL,
	"owner_score" numeric(5, 2),
	"employee_score" numeric(5, 2),
	"gap" numeric(5, 2),
	CONSTRAINT "dimension_results_assessment_id_dimension_id_pk" PRIMARY KEY("assessment_id","dimension_id")
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_response_id_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_option_id_question_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."question_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dimension_weights" ADD CONSTRAINT "dimension_weights_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dimension_weights" ADD CONSTRAINT "dimension_weights_dimension_id_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_dimension_id_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dimension_results" ADD CONSTRAINT "dimension_results_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dimension_results" ADD CONSTRAINT "dimension_results_dimension_id_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assessments_one_open_per_business_uq" ON "assessments" USING btree ("business_id") WHERE "assessments"."status" = 'OPEN';--> statement-breakpoint
CREATE UNIQUE INDEX "responses_assessment_user_uq" ON "responses" USING btree ("assessment_id","user_id");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_active_business_email_uq" ON "invitations" USING btree ("business_id","email") WHERE "invitations"."accepted_at" is null;--> statement-breakpoint
CREATE INDEX "memberships_business_role_idx" ON "memberships" USING btree ("business_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "instruments_one_active_per_role_uq" ON "instruments" USING btree ("target_role") WHERE "instruments"."is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "questions_instrument_key_uq" ON "questions" USING btree ("instrument_id","key");