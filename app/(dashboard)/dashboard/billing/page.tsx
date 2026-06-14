import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { getUserEvents } from "@/app/actions/event-actions";
import { BillingDashboard } from "./_components/billing-dashboard";
import { db, events, payments } from "@/lib/db";
import { eq, and, ne, desc } from "drizzle-orm";

export default async function Page() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }

  // 1. Fetch user events with their photo counts and guest counts
  const userEvents = await getUserEvents();
  const billingEvents = userEvents.map((e) => ({
    id: e.id,
    name: e.name,
    date: e.date,
    status: e.status,
    plan: e.plan as "free" | "premium" | "pro",
    photoLimit: e.photoLimit,
    photoCount: e.photoCount,
    retentionDays: e.retentionDays,
    expiresAt: e.expiresAt ? e.expiresAt.toISOString() : null,
    guestCount: e.guestCount,
  }));

  let purchases: any[] = [];
  try {
    const realPayments = await db
      .select({
        id: payments.id,
        eventId: payments.eventId,
        eventName: payments.eventName,
        plan: payments.plan,
        amount: payments.amount,
        createdAt: payments.createdAt,
        status: payments.status,
      })
      .from(payments)
      .where(eq(payments.userId, session.user.id))
      .orderBy(desc(payments.createdAt));

    purchases = realPayments.map((p) => {
      const price = `RM ${(p.amount / 100).toFixed(0)}`;
      return {
        id: p.id.startsWith("pur_") ? `INV-${p.id.substring(4, 12).toUpperCase()}` : `INV-${p.id.substring(0, 8).toUpperCase()}`,
        rawId: p.id,
        eventId: p.eventId || "",
        eventName: p.eventName,
        plan: p.plan === "premium" ? "Premium Upgrade" : "Pro Upgrade",
        price,
        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-MY", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) : "N/A",
        status: p.status === "paid" ? "Paid" : p.status === "pending" ? "Pending" : "Failed",
      };
    });
  } catch (err) {
    console.error("Failed to fetch billing purchases:", err);
  }

  return (
    <BillingDashboard
      initialEvents={billingEvents}
      initialPurchases={purchases}
    />
  );
}
