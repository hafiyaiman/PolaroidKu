import { users, events, wishes, payments, logs, userSettings } from "@/lib/db/schema";

export type DbUser = typeof users.$inferSelect;
export type DbEvent = typeof events.$inferSelect;
export type DbWish = typeof wishes.$inferSelect;
export type DbPayment = typeof payments.$inferSelect;
export type DbLog = typeof logs.$inferSelect;
export type DbUserSettings = typeof userSettings.$inferSelect;

export interface DashboardEvent extends DbEvent {
  guestCount: number;
}
