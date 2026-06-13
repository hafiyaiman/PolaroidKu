import { pgSchema, pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

// Define the existing neon_auth schema managed by Neon Auth
export const neonAuthSchema = pgSchema("neon_auth");

// Map user table from the neon_auth schema
export const users = neonAuthSchema.table("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  role: text("role"),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

/**
 * Plans:
 *   free     — 20 photos, 30-day retention
 *   premium  — 1,000 photos, 60-day retention (RM29)
 *   pro      — 3,000 photos, 180-day retention (RM59)
 */
export const events = pgTable("events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  userId: text("user_id").notNull(),
  status: text("status").notNull().default("Active"), // 'Active' | 'Archived' | 'Draft'
  welcomeMessage: text("welcome_message").default("Welcome to our Guestbook! Snap a photo and leave a wish."),
  // Usage-based plan fields
  plan: text("plan").notNull().default("free"),        // 'free' | 'premium' | 'pro'
  photoLimit: integer("photo_limit").notNull().default(50),
  photoCount: integer("photo_count").notNull().default(0),
  retentionDays: integer("retention_days").notNull().default(30),
  expiresAt: timestamp("expires_at", { withTimezone: true }),  // set on creation; cron deletes after
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  // Payment tracking
  pendingPurchaseId: text("pending_purchase_id"), // CHIP purchase ID awaiting confirmation
});


// Guest photo + wish submissions
export const wishes = pgTable("wishes", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  guestName: text("guest_name").notNull(),
  wish: text("wish").notNull(),
  imageKey: text("image_key").notNull(), // Cloudflare R2 object key
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// System activity/audit logs
export const logs = pgTable("logs", {
  id: text("id").primaryKey(),
  userId: text("user_id"), // plain text, no references constraint (matches events table)
  action: text("action").notNull(), // e.g. "create_event", "upload_photo", "delete_event"
  details: text("details"), // JSON string or text descriptions
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// User settings and preferences
export const userSettings = pgTable("user_settings", {
  userId: text("user_id").primaryKey(),
  phoneNumber: text("phone_number"),
  defaultEventVisibility: text("default_event_visibility").default("public").notNull(), // 'public' | 'private'
  defaultTheme: text("default_theme").default("dark").notNull(), // 'dark' | 'light' | 'system'
  notifyOnUpload: boolean("notify_on_upload").default(true).notNull(),
  notifyOnLimit: boolean("notify_on_limit").default(true).notNull(),
  notifyOnExpiry: boolean("notify_on_expiry").default(true).notNull(),
  notifyOnReceipt: boolean("notify_on_receipt").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});


