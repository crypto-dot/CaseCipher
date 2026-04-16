ALTER TABLE "audit_log" DISABLE ROW LEVEL SECURITY;
DROP TABLE "audit_log" CASCADE;
ALTER TABLE "user_profiles" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;
ALTER TABLE "user_profiles" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."user"("id") ON DELETE cascade ON UPDATE no action;