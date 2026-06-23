CREATE TABLE "event_borders" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text,
	"image_key" text NOT NULL,
	"layout_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_settings" ADD COLUMN "preheader_color" text;--> statement-breakpoint
ALTER TABLE "event_settings" ADD COLUMN "subheader_color" text;--> statement-breakpoint
ALTER TABLE "event_settings" ADD COLUMN "show_public_gallery" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "neon_auth"."user" ADD COLUMN "banned" boolean;--> statement-breakpoint
ALTER TABLE "neon_auth"."user" ADD COLUMN "banReason" text;--> statement-breakpoint
ALTER TABLE "event_borders" ADD CONSTRAINT "event_borders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_borders_event_id_idx" ON "event_borders" USING btree ("event_id");