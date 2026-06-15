import { users, events, eventSettings, submissions, payments, logs, userSettings } from "@/lib/db/schema";

export type DbUser = typeof users.$inferSelect;
export type DbEvent = typeof events.$inferSelect;
export type DbEventSettings = typeof eventSettings.$inferSelect;
export type DbSubmission = typeof submissions.$inferSelect;
export type DbPayment = typeof payments.$inferSelect;
export type DbLog = typeof logs.$inferSelect;
export type DbUserSettings = typeof userSettings.$inferSelect;

export interface DashboardEventDetails extends DbEvent {
  template: string | null;
  coverImageKey: string | null;
  preheader: string | null;
  subheader: string | null;
  buttonShape: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  bgColor: string | null;
  coverImageUrl?: string;
}

export interface DashboardEvent extends DashboardEventDetails {
  guestCount: number;
}
