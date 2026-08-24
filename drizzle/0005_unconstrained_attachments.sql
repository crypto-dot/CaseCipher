CREATE TABLE IF NOT EXISTS "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"evidence_id" uuid,
	"pathname" text NOT NULL,
	"url" text NOT NULL,
	"download_url" text,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" bigint NOT NULL,
	"sha256" varchar(64),
	"md5" varchar(32),
	"uploaded_by" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attachments_pathname_unique" UNIQUE("pathname")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attachments_case_id_idx" ON "attachments" USING btree ("case_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attachments_evidence_id_idx" ON "attachments" USING btree ("evidence_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attachments_uploaded_by_idx" ON "attachments" USING btree ("uploaded_by");
--> statement-breakpoint
ALTER TABLE "attachments" DROP CONSTRAINT IF EXISTS "attachments_case_id_cases_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" DROP CONSTRAINT IF EXISTS "attachments_evidence_id_evidence_id_fk";
