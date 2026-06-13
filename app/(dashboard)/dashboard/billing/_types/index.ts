export interface BillingEvent {
  id: string;
  name: string;
  date: string;
  status: string;
  plan: "free" | "premium" | "pro";
  photoLimit: number;
  photoCount: number;
  retentionDays: number;
  expiresAt: string | null;
  guestCount: number;
}

export interface PurchaseInvoice {
  id: string;
  eventId: string;
  eventName: string;
  plan: string;
  price: string;
  date: string;
  status: string;
}
