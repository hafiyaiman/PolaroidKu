-- 1. Modify "events" table
ALTER TABLE "events" ADD COLUMN "slug" text;
UPDATE "events" SET "slug" = "id" WHERE "slug" IS NULL;
ALTER TABLE "events" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "events" ADD CONSTRAINT "events_slug_unique" UNIQUE ("slug");

ALTER TABLE "events" ADD COLUMN "storage_used_bytes" integer DEFAULT 0 NOT NULL;
ALTER TABLE "events" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE "events" ADD COLUMN "pending_purchase_id" text;
ALTER TABLE "events" DROP COLUMN "welcome_message";
ALTER TABLE "events" ALTER COLUMN "status" SET DEFAULT 'draft';

-- Align existing status values to match new database enum ('draft', 'published', 'expired', 'archived')
UPDATE "events" SET "status" = 'published' WHERE "status" = 'Active';
UPDATE "events" SET "status" = 'draft' WHERE "status" = 'Draft';
UPDATE "events" SET "status" = 'archived' WHERE "status" = 'Archived';

-- Create events indexes
CREATE INDEX IF NOT EXISTS "events_user_id_idx" ON "events" ("user_id");
CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" ("created_at");

-- 2. Create "event_settings" table
CREATE TABLE "event_settings" (
  "event_id" text PRIMARY KEY NOT NULL REFERENCES "public"."events"("id") ON DELETE cascade,
  "template" text DEFAULT 'classic' NOT NULL,
  "cover_image_key" text,
  "preheader" text DEFAULT 'Our Guestbook' NOT NULL,
  "subheader" text,
  "button_shape" text DEFAULT 'rounded' NOT NULL,
  "text_color" text DEFAULT '#0F172A' NOT NULL,
  "button_color" text DEFAULT '#0F172A' NOT NULL,
  "button_text_color" text DEFAULT '#FFFFFF' NOT NULL,
  "bg_color" text DEFAULT '#FAF9F5' NOT NULL
);

-- Initialize default customizer settings for existing events
INSERT INTO "event_settings" ("event_id", "template", "preheader", "button_shape", "text_color", "button_color", "button_text_color", "bg_color")
SELECT "id", 'classic', 'Our Guestbook', 'rounded', '#0F172A', '#0F172A', '#FFFFFF', '#FAF9F5' FROM "events"
ON CONFLICT DO NOTHING;

-- 3. Rename "wishes" to "submissions" table and modify it
ALTER TABLE "wishes" RENAME TO "submissions";
ALTER TABLE "submissions" RENAME COLUMN "wish" TO "message";
ALTER TABLE "submissions" ADD COLUMN "image_size" integer;
ALTER TABLE "submissions" ADD COLUMN "mime_type" text;
ALTER TABLE "submissions" ADD COLUMN "status" text DEFAULT 'visible' NOT NULL;
ALTER TABLE "submissions" ADD COLUMN "report_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "submissions" ADD COLUMN "hidden_reason" text;
ALTER TABLE "submissions" ADD COLUMN "hidden_at" timestamp with time zone;

-- Create submissions indexes
CREATE INDEX IF NOT EXISTS "submissions_event_id_idx" ON "submissions" ("event_id");
CREATE INDEX IF NOT EXISTS "submissions_created_at_idx" ON "submissions" ("created_at");

-- 4. Modify "user_settings" table
ALTER TABLE "user_settings" DROP COLUMN "default_event_visibility";
ALTER TABLE "user_settings" RENAME COLUMN "default_theme" TO "theme";

-- 5. Create "payments" table
CREATE TABLE "payments" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "neon_auth"."user"("id") ON DELETE cascade,
  "event_id" text REFERENCES "public"."events"("id") ON DELETE set null,
  "event_name" text NOT NULL,
  "plan" text NOT NULL,
  "amount" integer NOT NULL,
  "currency" text DEFAULT 'MYR' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "payment_gateway" text DEFAULT 'CHIP' NOT NULL,
  "photo_limit_snapshot" integer,
  "retention_days_snapshot" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create payments indexes
CREATE INDEX IF NOT EXISTS "payments_user_id_idx" ON "payments" ("user_id");
CREATE INDEX IF NOT EXISTS "payments_event_id_idx" ON "payments" ("event_id");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments" ("status");
CREATE INDEX IF NOT EXISTS "payments_created_at_idx" ON "payments" ("created_at");

-- 6. Rename "logs" to "audit_logs" and modify it
ALTER TABLE "logs" RENAME TO "audit_logs";
ALTER TABLE "audit_logs" RENAME COLUMN "details" TO "metadata";
ALTER TABLE "audit_logs" ADD COLUMN "entity_type" text;
ALTER TABLE "audit_logs" ADD COLUMN "entity_id" text;

-- Create audit_logs indexes
CREATE INDEX IF NOT EXISTS "logs_user_id_idx" ON "audit_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "logs_created_at_idx" ON "audit_logs" ("created_at");