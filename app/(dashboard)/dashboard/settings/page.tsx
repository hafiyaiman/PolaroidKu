import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "./_components/settings-form";
import { getSettings, getUsageMetrics, getSessionsAction } from "./_actions/settings-actions";
import { db, events } from "@/lib/db";
import { eq, and, ne } from "drizzle-orm";

export default async function Page() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }

  // 1. Get user Settings details
  const settingsRes = await getSettings();
  const settings = settingsRes.success && settingsRes.settings
    ? {
        ...settingsRes.settings,
        defaultEventVisibility: settingsRes.settings.defaultEventVisibility as "public" | "private",
        defaultTheme: settingsRes.settings.defaultTheme as "dark" | "light" | "system",
      }
    : null;

  // 2. Get Usage Metrics
  const usageRes = await getUsageMetrics();
  const usage = usageRes.success ? usageRes.metrics : null;

  // 3. Get Active Sessions
  const sessionsRes = await getSessionsAction();
  const activeSessions = sessionsRes.success ? sessionsRes.sessions : [];

  // 4. Get Upgraded event purchases
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
    console.error("Failed to fetch event purchases:", err);
  }

  const user = {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email,
    role: session.user.role || "user",
    image: session.user.image || "",
  };

  return (
    <SettingsForm
      user={user}
      initialSettings={settings}
      initialUsage={usage}
      initialSessions={activeSessions}
      initialPurchases={purchases}
    />
  );
}
