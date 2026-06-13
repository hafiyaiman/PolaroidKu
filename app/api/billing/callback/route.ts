import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db, events } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { logActivity } from "@/app/(dashboard)/dashboard/events/_actions/event-actions";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");
  const plan = searchParams.get("plan");

  const failureUrl = (msg: string) =>
    new URL(`/dashboard/billing?error=${encodeURIComponent(msg)}`, request.url).toString();

  if (!event_id || !plan) {
    return NextResponse.redirect(failureUrl("missing_params"));
  }

  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 1. Load event + its pending purchase ID from DB
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, event_id), eq(events.userId, session.user.id)));

    if (!event) {
      return NextResponse.redirect(failureUrl("event_not_found"));
    }

    const purchaseId = event.pendingPurchaseId;
    if (!purchaseId) {
      return NextResponse.redirect(failureUrl("no_pending_payment"));
    }

    // 2. Verify with CHIP API
    const chipKey = (process.env.CHIP_KEY || "").replace(/^"|"$/g, "");
    const res = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${purchaseId}/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${chipKey}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[CHIP Callback] Verification error:", res.status, errText);
      return NextResponse.redirect(failureUrl("verification_failed"));
    }

    const purchase = await res.json();
    console.log("[CHIP Callback] Purchase status:", purchase.status, "| ID:", purchaseId);

    if (purchase.status !== "paid") {
      return NextResponse.redirect(
        new URL(
          `/dashboard/billing?error=payment_not_completed&status=${purchase.status}`,
          request.url
        ).toString()
      );
    }

    // 3. Apply upgrade in DB
    const limits: Record<string, { photoLimit: number; retentionDays: number }> = {
      premium: { photoLimit: 1000, retentionDays: 90 },
      pro:     { photoLimit: 3000, retentionDays: 180 },
    };
    const { photoLimit, retentionDays } = limits[plan] ?? limits.premium;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    await db
      .update(events)
      .set({
        plan: plan as "premium" | "pro",
        photoLimit,
        retentionDays,
        expiresAt,
        pendingPurchaseId: null, // clear after successful upgrade
      })
      .where(eq(events.id, event_id));

    // 4. Log activity + revalidate — legal here because it's a Route Handler, not a render
    await logActivity(
      "upgrade_event",
      `Upgraded event "${event.name}" to "${plan}" plan via CHIP (Purchase ID: ${purchaseId})`
    );

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard");

    // 5. Redirect to standalone success page
    const successUrl = new URL("/billing/success", request.url);
    successUrl.searchParams.set("event_name", event.name);
    successUrl.searchParams.set("plan", plan);
    successUrl.searchParams.set("photo_limit", String(photoLimit));
    successUrl.searchParams.set("retention_days", String(retentionDays));
    successUrl.searchParams.set("receipt_id", purchaseId);

    return NextResponse.redirect(successUrl.toString());
  } catch (error) {
    console.error("[CHIP Callback] Unexpected error:", error);
    return NextResponse.redirect(failureUrl("server_error"));
  }
}
