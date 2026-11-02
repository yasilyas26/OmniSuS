CREATE TABLE "cross_check_results" (
	"assessment_id" uuid NOT NULL,
	"pair_key" varchar(60) NOT NULL,
	"statement" text NOT NULL,
	"owner_value" integer,
	"employee_mean" numeric(4, 2),
	CONSTRAINT "cross_check_results_assessment_id_pair_key_pk" PRIMARY KEY("assessment_id","pair_key")
);
--> statement-breakpoint
ALTER TABLE "cross_check_results" ADD CONSTRAINT "cross_check_results_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;