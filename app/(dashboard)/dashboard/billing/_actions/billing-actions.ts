"use server";

import { db, events, payments } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { eq, and } from "drizzle-orm";
import { logActivity } from "../../events/_actions/event-actions";
import { revalidatePath } from "next/cache";

import { headers } from "next/headers";

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
    });

    return { success: true, checkoutUrl: data.checkout_url };
  } catch (error: any) {
    console.error("Failed to upgrade event:", error);
    return { error: error.message || "Failed to upgrade event." };
  }
}

