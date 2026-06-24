"use server";

import { db, users, events, submissions, payments, logs } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { eq, count, desc, sum, gt, and, ne } from "drizzle-orm";
import { getUserStorageSize } from "@/lib/storage/r2";

import { AdminSessionUser, AuthAdminApi } from "../_types";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function getAllUsersForAdmin() {
  const { data: session } = await auth.getSession();
  const isUserAdmin = (session?.user as AdminSessionUser)?.role === "admin" || session?.user?.email?.includes("admin");
  if (!isUserAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

    const usersWithStats = await Promise.all(
      allUsers.map(async (u) => {
        const [eventCountResult] = await db
          .select({ value: count() })
          .from(events)
          .where(eq(events.userId, u.id));

        const actualBytes = await getUserStorageSize(u.id);
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
        const bucketName = process.env.R2_BUCKET_NAME || "polaroidku";
        const prefix = `users/${u.id}/`;
        const r2ConsoleUrl = accountId 
          ? `https://dash.cloudflare.com/${accountId}/r2/default/buckets/${bucketName}?prefix=${prefix}`
          : "";

        return {
          id: u.id,
          name: u.name || "Anonymous User",
          email: u.email,
          role: u.role || "user",
          banned: u.banned ?? false,
          banReason: u.banReason || null,
          eventsCount: eventCountResult?.value || 0,
          bucketSize: formatBytes(actualBytes),
          r2ConsoleUrl,
        };
      })
    );

    return { success: true, users: usersWithStats };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to fetch admin users directory:", error);
    return { error: error.message || "Failed to load users." };
  }
}

export async function deleteUserAction(userId: string) {
  const { data: session } = await auth.getSession();
  const isUserAdmin = (session?.user as AdminSessionUser)?.role === "admin" || session?.user?.email?.includes("admin");
  if (!isUserAdmin) {
    return { error: "Unauthorized" };
  }

  // Prevent self-deletion
  if (session?.user?.id === userId) {
    return { error: "You cannot delete yourself" };
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to delete user:", error);
    return { error: error.message || "Failed to delete user." };
  }
}

export async function banUserAction(userId: string, reason?: string) {
  const { data: session } = await auth.getSession();
  const isUserAdmin = (session?.user as AdminSessionUser)?.role === "admin" || session?.user?.email?.includes("admin");
  if (!isUserAdmin) {
    return { error: "Unauthorized" };
  }

  if (session?.user?.id === userId) {
    return { error: "You cannot ban yourself" };
  }

  const actualReason = reason || "Banned by Administrator";

  try {
    const { error } = await (auth as unknown as AuthAdminApi).admin.banUser({
      userId,
      banReason: actualReason,
    });
    if (error) {
      return { error: error.message || "Failed to ban user via auth server" };
    }

    await db.update(users).set({ banned: true, banReason: actualReason }).where(eq(users.id, userId));
    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to ban user:", error);
    return { error: error.message || "Failed to ban user." };
  }
}

export async function unbanUserAction(userId: string) {
  const { data: session } = await auth.getSession();
  const isUserAdmin = (session?.user as AdminSessionUser)?.role === "admin" || session?.user?.email?.includes("admin");
  if (!isUserAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const { error } = await (auth as unknown as AuthAdminApi).admin.unbanUser({ userId });
    if (error) {
      return { error: error.message || "Failed to unban user via auth server" };
    }

    await db.update(users).set({ banned: false, banReason: null }).where(eq(users.id, userId));
    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to unban user:", error);
    return { error: error.message || "Failed to unban user." };
  }
}

export async function updateUserRoleAction(userId: string, role: "user" | "admin") {
  const { data: session } = await auth.getSession();
  const isUserAdmin = (session?.user as AdminSessionUser)?.role === "admin" || session?.user?.email?.includes("admin");
  if (!isUserAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    // Call Neon Auth server-side setRole API
    const { error } = await (auth as unknown as AuthAdminApi).admin.setRole({
      userId,
      role,
    });
    if (error) {
      return { error: error.message || "Failed to set user role via auth server" };
    }

    await db.update(users).set({ role }).where(eq(users.id, userId));
    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to update user role:", error);
    return { error: error.message || "Failed to update user role." };
  }
}

export async function getAdminOverviewData() {
  const { data: session } = await auth.getSession();
  const isUserAdmin = (session?.user as AdminSessionUser)?.role === "admin" || session?.user?.email?.includes("admin");
  if (!isUserAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const [totalUsersRes] = await db.select({ value: count() }).from(users);
    const [activeEventsRes] = await db.select({ value: count() }).from(events).where(eq(events.status, "published"));
    const [totalPhotosRes] = await db.select({ value: count() }).from(submissions);
    const [revenueRes] = await db.select({ value: sum(payments.amount) }).from(payments).where(eq(payments.status, "paid"));

    const totalUsers = totalUsersRes?.value || 0;
    const activeEvents = activeEventsRes?.value || 0;
    const totalPhotos = totalPhotosRes?.value || 0;
    const rawRevenue = Number(revenueRes?.value || 0);
    const totalRevenue = `RM ${(rawRevenue / 100).toFixed(2)}`;

    const [totalEventsRes] = await db.select({ value: count() }).from(events);
    const [upgradedEventsRes] = await db.select({ value: count() }).from(events).where(ne(events.plan, "free"));
    const totalEvents = totalEventsRes?.value || 0;
    const upgradedEventsCount = upgradedEventsRes?.value || 0;
    const conversionRate = totalEvents > 0 ? Math.round((upgradedEventsCount / totalEvents) * 100) : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPayments = await db
      .select({
        amount: payments.amount,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(and(gt(payments.createdAt, sevenDaysAgo), eq(payments.status, "paid")));

    const dailyRevenueMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
      dailyRevenueMap.set(key, 0);
    }

    recentPayments.forEach((p) => {
      const key = new Date(p.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short" });
      if (dailyRevenueMap.has(key)) {
        dailyRevenueMap.set(key, (dailyRevenueMap.get(key) || 0) + p.amount / 100);
      }
    });

    const chartData = Array.from(dailyRevenueMap.entries()).map(([label, amount]) => ({
      label,
      amount,
    }));

    const maxVal = Math.max(...chartData.map(d => d.amount), 50);

    const realLogs = await db
      .select({
        id: logs.id,
        action: logs.action,
        metadata: logs.metadata,
        createdAt: logs.createdAt,
        userId: logs.userId,
      })
      .from(logs)
      .orderBy(desc(logs.createdAt))
      .limit(4);

    const formattedLogs = await Promise.all(
      realLogs.map(async (log) => {
        const actionLabel = (log.action || "SYSTEM").toUpperCase();
        const timeString = log.createdAt
          ? new Date(log.createdAt).toLocaleTimeString("en-MY", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
          : "00:00:00";
        
        let details = log.metadata || "";
        details = details.replace(/r2:\/\//gi, "storage://");
        details = details.replace(/cloudflare r2/gi, "cloud storage");
        details = details.replace(/neon/gi, "database");

        let userEmail = "SYSTEM";
        if (log.userId) {
          const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, log.userId));
          if (u?.email) {
            userEmail = u.email;
          }
        }

        return {
          time: timeString,
          action: actionLabel,
          details,
          user: userEmail,
        };
      })
    );

    const bucketName = process.env.R2_BUCKET_NAME || "polaroidku";

    return {
      success: true,
      data: {
        totalUsers,
        activeEvents,
        totalPhotos,
        totalRevenue,
        conversionRate,
        chartData,
        maxVal,
        formattedLogs,
        bucketName,
      }
    };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to fetch admin overview data:", error);
    return { error: error.message || "Failed to load overview data." };
  }
}

export async function getAdminBillingData() {
  const { data: session } = await auth.getSession();
  const isUserAdmin = (session?.user as AdminSessionUser)?.role === "admin" || session?.user?.email?.includes("admin");
  if (!isUserAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const realTransactions = await db
      .select({
        id: payments.id,
        eventName: payments.eventName,
        plan: payments.plan,
        amount: payments.amount,
        status: payments.status,
        createdAt: payments.createdAt,
        userId: payments.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .orderBy(desc(payments.createdAt));

    const [totalEventsRes] = await db.select({ value: count() }).from(events);
    const [upgradedEventsRes] = await db.select({ value: count() }).from(events).where(ne(events.plan, "free"));

    const totalEvents = totalEventsRes?.value || 0;
    const upgradedEventsCount = upgradedEventsRes?.value || 0;
    const conversionRate = totalEvents > 0 ? Math.round((upgradedEventsCount / totalEvents) * 100) : 0;

    return {
      success: true,
      data: {
        realTransactions: realTransactions.map(tx => ({
          ...tx,
          createdAt: tx.createdAt ? tx.createdAt.toISOString() : null,
        })),
        totalEvents,
        upgradedEventsCount,
        conversionRate,
      }
    };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to fetch admin billing data:", error);
    return { error: error.message || "Failed to load billing data." };
  }
}

