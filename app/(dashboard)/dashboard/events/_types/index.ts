export type EventPlan = "free" | "premium" | "pro";

export interface Event {
  id: string;
  name: string;
  date: string;
  userId: string;
  status: string;
  plan: EventPlan;
  photoLimit: number;
  photoCount: number;
  retentionDays: number;
  expiresAt: string | null;
  guestCount?: number;
  createdAt?: string | null;
}

export interface Submission {
  id: string;
  guestName: string;
  wish: string;
  imageUrl: string;
  time: string;
}
