CREATE SCHEMA "neon_auth";
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"welcome_message" text DEFAULT 'Welcome to our Guestbook! Snap a photo and leave a wish.',
	"plan" text DEFAULT 'free' NOT NULL,
	"photo_limit" integer DEFAULT 50 NOT NULL,
	"photo_count" integer DEFAULT 0 NOT NULL,
	"retention_days" integer DEFAULT 30 NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"phone_number" text,
	"default_event_visibility" text DEFAULT 'public' NOT NULL,
	"default_theme" text DEFAULT 'dark' NOT NULL,
	"notify_on_upload" boolean DEFAULT true NOT NULL,
	"notify_on_limit" boolean DEFAULT true NOT NULL,
	"notify_on_expiry" boolean DEFAULT true NOT NULL,
	"notify_on_receipt" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "neon_auth"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"role" text,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "wishes" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"guest_name" text NOT NULL,
	"wish" text NOT NULL,
	"image_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;