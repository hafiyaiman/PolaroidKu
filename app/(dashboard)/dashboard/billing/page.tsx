import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { getUserEvents } from "@/app/actions/event-actions";
import { BillingDashboard } from "./_components/billing-dashboard";
import { db, events } from "@/lib/db";
import { eq, and, ne } from "drizzle-orm";

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

  // 2. Fetch upgraded purchases
  let purchases: any[] = [];
  try {
    const upgradedEvents = await db
      .select()
      .from(events)
      .where(and(eq(events.userId, session.user.id), ne(events.plan, "free")));

    purchases = upgradedEvents.map((event) => {
      let price = "RM0";
      if (event.plan === "premium") price = "RM29";
      if (event.plan === "pro") price = "RM59";

      return {
        id: `INV-${event.id.substring(0, 8).toUpperCase()}`,
        eventId: event.id,
        eventName: event.name,
        plan: event.plan === "premium" ? "Premium Event" : "Pro Event",
        price,
        date: event.createdAt ? new Date(event.createdAt).toLocaleDateString("en-MY", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) : "N/A",
        status: "Paid",
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
