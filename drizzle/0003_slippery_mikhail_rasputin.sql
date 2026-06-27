--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"user_name" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"changes" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custody_events" (
	"event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evidence_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"from_custodian" uuid,
	"to_custodian" uuid,
	"from_location" varchar(255),
	"to_location" varchar(255),
	"reason" text,
	"notes" text,
	"event_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"recorded_by" uuid NOT NULL,
	"transferor_signature" text,
	"recipient_signature" text,
	"signature_verified" boolean DEFAULT false,
	"row_hash" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "personnel" (
	"person_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"badge_or_employee_id" varchar(50),
	"organization" varchar(100),
	"role" varchar(50),
	"email" varchar(150),
	"is_active" boolean DEFAULT true,
	CONSTRAINT "personnel_badge_or_employee_id_unique" UNIQUE("badge_or_employee_id")
);
--> statement-breakpoint
ALTER TABLE "evidence" RENAME COLUMN "id" TO "evidence_id";--> statement-breakpoint
ALTER TABLE "evidence" RENAME COLUMN "name" TO "evidence_number";--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "status" SET DEFAULT 'new_case'::text;--> statement-breakpoint
DROP TYPE "public"."case_status";--> statement-breakpoint
CREATE TYPE "public"."case_status" AS ENUM('new_case', 'intake', 'processing', 'investigation', 'report', 'review');--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "status" SET DEFAULT 'new_case'::"public"."case_status";--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "status" SET DATA TYPE "public"."case_status" USING "status"::"public"."case_status";--> statement-breakpoint
ALTER TABLE "evidence" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "evidence" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "case_type" text;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "requestor" text;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "assigned_examiner" text;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "subject_name" text;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "date_received" date;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "date_due" date;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "label" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "evidence_type" varchar(50);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "date_seized" date;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "make" varchar(100);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "model" varchar(100);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "serial_number" varchar(120);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "storage_location" varchar(255);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "seized_by" varchar(120);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "acquisition_method" varchar(50);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "acquisition_tool" varchar(120);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "media" jsonb;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "collected_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "collection_location" text;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "hash_md5" varchar(32);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "hash_sha256" varchar(64);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "hash_sha512" varchar(128);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "current_location" varchar(255);--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "current_custodian" uuid;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "status" varchar(30) DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "custody_events" ADD CONSTRAINT "custody_events_evidence_id_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("evidence_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custody_events" ADD CONSTRAINT "custody_events_from_custodian_personnel_id_fk" FOREIGN KEY ("from_custodian") REFERENCES "public"."personnel"("person_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custody_events" ADD CONSTRAINT "custody_events_to_custodian_personnel_id_fk" FOREIGN KEY ("to_custodian") REFERENCES "public"."personnel"("person_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custody_events" ADD CONSTRAINT "custody_events_recorded_by_personnel_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."personnel"("person_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_current_custodian_personnel_person_id_fk" FOREIGN KEY ("current_custodian") REFERENCES "public"."personnel"("person_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_current_custodian_personnel_id_fk" FOREIGN KEY ("current_custodian") REFERENCES "public"."personnel"("person_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" DROP COLUMN "file_url";--> statement-breakpoint
ALTER TABLE "evidence" DROP COLUMN "file_type";--> statement-breakpoint
ALTER TABLE "evidence" DROP COLUMN "file_size";--> statement-breakpoint
ALTER TABLE "evidence" DROP COLUMN "chain_of_custody";--> statement-breakpoint
ALTER TABLE "evidence" DROP COLUMN "uploaded_by";