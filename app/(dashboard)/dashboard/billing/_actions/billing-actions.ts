"use server";

import { db, events, payments } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { eq, and, desc } from "drizzle-orm";

import { headers } from "next/headers";
import { getUserEvents } from "@/app/actions/event-actions";

export async function upgradeEventAction(eventId: string, plan: "premium" | "pro") {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    // 1. Verify ownership of the event
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.userId, session.user.id)));

    if (!event) {
      return { error: "Event not found or unauthorized." };
    }

    // 2. Setup CHIP variables
    const chipKey = (process.env.CHIP_KEY || "").replace(/^"|"$/g, "");
    const chipBrandKey = (process.env.CHIP_BRAND_KEY || "").replace(/^"|"$/g, "");

    if (!chipKey || !chipBrandKey) {
      return { error: "Payment gateway is not configured." };
    }

    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const amount = plan === "premium" ? 2900 : 5900; // in cents (RM29 or RM59)
    const PLAN_LIMITS = {
      premium: { photoLimit: 1000, retentionDays: 90  },
      pro:     { photoLimit: 3000, retentionDays: 180 },
    } as const;
    const limits = PLAN_LIMITS[plan];

    const payload = {
      brand_id: chipBrandKey,
      client: {
        email: session.user.email,
        full_name: session.user.name || "Customer",
      },
      // Top-level reference so CHIP persists it on the purchase object
      reference: `${eventId}:${plan}`,
      purchase: {
        products: [
          {
            name: plan === "premium" ? "Premium Event Upgrade" : "Pro Event Upgrade",
            price: amount,
            quantity: 1,
          },
        ],
        currency: "MYR",
      },
      success_redirect: `${baseUrl}/api/billing/callback?event_id=${eventId}&plan=${plan}`,
      failure_redirect: `${baseUrl}/dashboard/billing?error=payment_failed`,
    };

    // 3. Initiate payment request with CHIP
    const response = await fetch("https://gate.chip-in.asia/api/v1/purchases/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chipKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("CHIP purchase API error:", errText);
      return { error: `Payment gateway initialization failed.` };
    }

    const data = await response.json();

    // 4. Store purchase ID in the DB so the success page can look it up reliably
    await db
      .update(events)
      .set({ pendingPurchaseId: data.id })
      .where(eq(events.id, eventId));

    // 5. Create a pending payment ledger entry in the payments table
    await db.insert(payments).values({
      id: data.id,
      userId: session.user.id,
      eventId: eventId,
      eventName: event.name,
      plan: plan,
      amount: amount,
      currency: "MYR",
      status: "pending",
      paymentGateway: "CHIP",
      photoLimitSnapshot: limits.photoLimit,
      retentionDaysSnapshot: limits.retentionDays,
    });

    return { success: true, checkoutUrl: data.checkout_url };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to upgrade event:", error);
    return { error: error.message || "Failed to upgrade event." };
  }
}

export async function getBillingDataAction() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
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

    const purchases = realPayments.map((p) => {
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

    return { success: true, events: billingEvents, purchases };
  } catch (err) {
    console.error("Failed to fetch billing data:", err);
    return { error: "Failed to fetch billing data." };
  }
}

