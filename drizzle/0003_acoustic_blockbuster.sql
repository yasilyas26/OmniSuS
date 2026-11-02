-- Diedit tangan sebelum diterapkan: drizzle-kit tidak bisa mengganti primary key tabel yang sudah ada.
-- Aman karena site_content belum berisi data (belum ada UI penyuntingnya saat migrasi ini dibuat).
DROP TABLE IF EXISTS "site_content";--> statement-breakpoint
CREATE TABLE "site_content" (
	"section" varchar(40) NOT NULL,
	"locale" varchar(5) DEFAULT 'id' NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "site_content_section_locale_pk" PRIMARY KEY("section","locale")
);
--> statement-breakpoint
ALTER TABLE "site_content" ADD CONSTRAINT "site_content_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dimensions" ADD COLUMN "name_en" varchar(120);--> statement-breakpoint
ALTER TABLE "dimensions" ADD COLUMN "description_en" text;
