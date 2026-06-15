import { pgSchema, pgTable, text, timestamp, integer, boolean, index, uuid } from "drizzle-orm/pg-core";

// Define the existing neon_auth schema managed by Neon Auth
export const neonAuthSchema = pgSchema("neon_auth");

// Map user table from the neon_auth schema
export const users = neonAuthSchema.table("user", {
  id: uuid("id").primaryKey(), // Using uuid mapping to match Neon Auth's real column type
  name: text("name"),
  email: text("email").notNull(),
  role: text("role"),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

/**
 * Plans:
 *   free     — 50 photos, 30-day retention
 *   premium  — 1,000 photos, 90-day retention (RM29)
 *   pro      — 3,000 photos, 180-day retention (RM59)
 */
export const events = pgTable("events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  date: text("date").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Type match uuid
  status: text("status").notNull().default("draft"), // 'draft' | 'published' | 'expired' | 'archived'
  plan: text("plan").notNull().default("free"),        // 'free' | 'premium' | 'pro'
  photoLimit: integer("photo_limit").notNull().default(50),
  photoCount: integer("photo_count").notNull().default(0),
  storageUsedBytes: integer("storage_used_bytes").notNull().default(0),
  retentionDays: integer("retention_days").notNull().default(30),
  expiresAt: timestamp("expires_at", { withTimezone: true }),  // set on creation; cron deletes after
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  pendingPurchaseId: text("pending_purchase_id"), // CHIP purchase ID awaiting confirmation
}, (table) => [
  index("events_user_id_idx").on(table.userId),
  index("events_created_at_idx").on(table.createdAt),
]);

// Theme and Customizer settings per Event
export const eventSettings = pgTable("event_settings", {
  eventId: text("event_id").primaryKey().references(() => events.id, { onDelete: "cascade" }),
  template: text("template").default("classic").notNull(),
  coverImageKey: text("cover_image_key"),
  preheader: text("preheader").default("Our Guestbook").notNull(),
  subheader: text("subheader"),
  buttonShape: text("button_shape").default("rounded").notNull(),
  textColor: text("text_color").default("#0F172A").notNull(),
  buttonColor: text("button_color").default("#0F172A").notNull(),
  buttonTextColor: text("button_text_color").default("#FFFFFF").notNull(),
  bgColor: text("bg_color").default("#FAF9F5").notNull(),
});

// Guest photo + signature submissions (replacing wishes)
export const submissions = pgTable("submissions", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  guestName: text("guest_name"),
  message: text("message"), // renamed from wish
  imageKey: text("image_key").notNull(), // Cloudflare R2 object key
  imageSize: integer("image_size"),
  mimeType: text("mime_type"),
  status: text("status").notNull().default("visible"), // 'visible' | 'hidden' | 'deleted'
  reportCount: integer("report_count").default(0).notNull(),
  hiddenReason: text("hidden_reason"),
  hiddenAt: timestamp("hidden_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("submissions_event_id_idx").on(table.eventId),
  index("submissions_created_at_idx").on(table.createdAt),
]);

// System activity/audit logs (normalized table)
export const logs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }), // Type match uuid
  entityType: text("entity_type"), // e.g. "event", "submission", "payment"
  entityId: text("entity_id"),
  action: text("action").notNull(), // e.g. "create", "update", "delete", "hide"
  metadata: text("metadata"), // JSON string or text descriptions (renamed from details)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("logs_user_id_idx").on(table.userId),
  index("logs_created_at_idx").on(table.createdAt),
]);

// User settings and preferences
export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }), // Type match uuid
  phoneNumber: text("phone_number"),
  theme: text("theme").default("dark").notNull(), // renamed from defaultTheme
  notifyOnUpload: boolean("notify_on_upload").default(true).notNull(),
  notifyOnLimit: boolean("notify_on_limit").default(true).notNull(),
  notifyOnExpiry: boolean("notify_on_expiry").default(true).notNull(),
  notifyOnReceipt: boolean("notify_on_receipt").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Billing and event upgrades transactions
export const payments = pgTable("payments", {
  id: text("id").primaryKey(), // Purchase ID or Gateway Transaction ID
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventId: text("event_id").references(() => events.id, { onDelete: "set null" }), // Keep transaction record even if event is deleted
  eventName: text("event_name").notNull(), // Cache event name at the time of payment
  plan: text("plan").notNull(), // 'premium' | 'pro'
  amount: integer("amount").notNull(), // Amount in cents (e.g. 2900, 5900)
  currency: text("currency").notNull().default("MYR"),
  status: text("status").notNull().default("pending"), // 'pending' | 'paid' | 'failed'
  paymentGateway: text("payment_gateway").notNull().default("CHIP"),
  photoLimitSnapshot: integer("photo_limit_snapshot"),
  retentionDaysSnapshot: integer("retention_days_snapshot"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("payments_user_id_idx").on(table.userId),
  index("payments_event_id_idx").on(table.eventId),
  index("payments_status_idx").on(table.status),
  index("payments_created_at_idx").on(table.createdAt),
]);
