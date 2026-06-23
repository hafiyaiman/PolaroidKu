"use server";

import { db, events, submissions, users, logs } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { eq, count, desc, and, gt, lte, inArray, sql, isNotNull, isNull } from "drizzle-orm";
import { getPresignedDownloadUrl, getUserStorageSize } from "@/lib/storage/r2";
import { type DbSubmission } from "@/types/db";
import { formatTimeAgo, formatBytes } from "@/lib/format";

import {
  createEvent as localCreateEvent,
  getUserEvents as localGetUserEvents,
  getEventDetails as localGetEventDetails,
} from "../(dashboard)/dashboard/events/_actions/event-actions";

export async function createEvent(data: Parameters<typeof localCreateEvent>[0]) {
  return localCreateEvent(data);
}

export async function getUserEvents() {
  return localGetUserEvents();
}

export async function getEventDetails(eventId: string) {
  return localGetEventDetails(eventId);
}

export async function getDashboardStats() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return {
      totalEvents: 0,
      totalWishes: 0,
      totalContributors: 0,
      expiringSoon: 0,
      storageUsed: "0 KB",
      activeTier: "Free Tier",
    };
  }

  try {
    // 1. Count events
    const [eventsCount] = await db
      .select({ value: count() })
      .from(events)
      .where(eq(events.userId, session.user.id));

    // 2. Count expiring soon events (expires in next 7 days)
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 7);

    const [expiringSoonCount] = await db
      .select({ value: count() })
      .from(events)
      .where(
        and(
          eq(events.userId, session.user.id),
          gt(events.expiresAt, now),
          lte(events.expiresAt, soon)
        )
      );

    // 3. Count submissions and contributors
    const userEvents = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.userId, session.user.id));

    let totalWishes = 0;
    let totalContributors = 0;

    if (userEvents.length > 0) {
      const eventIds = userEvents.map((e) => e.id);
      
      const [wishesCount] = await db
        .select({ value: count() })
        .from(submissions)
        .where(inArray(submissions.eventId, eventIds));
      totalWishes = wishesCount?.value || 0;

      // Unique contributors: distinct guest names + count of null guest names (each treated as unique contributor)
      const [distinctContributorsCount] = await db
        .select({ value: sql<number>`count(distinct ${submissions.guestName})` })
        .from(submissions)
        .where(
          and(
            inArray(submissions.eventId, eventIds),
            isNotNull(submissions.guestName)
          )
        );
      
      const [nullGuestNameCount] = await db
        .select({ value: count() })
        .from(submissions)
        .where(
          and(
            inArray(submissions.eventId, eventIds),
            isNull(submissions.guestName)
          )
        );
      
      totalContributors = (Number(distinctContributorsCount?.value) || 0) + (nullGuestNameCount?.value || 0);
    }

    // Storage: Fetch actual R2 storage size in bytes and format it
    const actualBytes = await getUserStorageSize(session.user.id);
    const storageUsed = formatBytes(actualBytes);

    // Determine account role/tier
    const activeTier = (session.user as any).role === "admin" ? "Super Admin" : "Free Plan";

    return {
      totalEvents: eventsCount?.value || 0,
      totalWishes,
      totalContributors,
      expiringSoon: expiringSoonCount?.value || 0,
      storageUsed,
      activeTier,
    };
  } catch (error) {
    console.error("Failed to calculate dashboard stats:", error);
    return {
      totalEvents: 0,
      totalWishes: 0,
      totalContributors: 0,
      expiringSoon: 0,
      storageUsed: "0 MB",
      activeTier: "Free Plan",
    };
  }
}

export async function getRecentSubmissions() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return [];
  }

  try {
    // Get user events
    const userEvents = await db
      .select()
      .from(events)
      .where(eq(events.userId, session.user.id));

    if (userEvents.length === 0) {
      return [];
    }

    const eventIds = userEvents.map((e) => e.id);
    const eventMap = new Map(userEvents.map((e) => [e.id, e.name]));

    // Fetch recent submissions across all user events
    const recentWishes = await db
      .select()
      .from(submissions)
      .where(inArray(submissions.eventId, eventIds))
      .orderBy(desc(submissions.createdAt))
      .limit(5);

    const mappedWishes = await Promise.all(
      recentWishes.map(async (w) => {
        const downloadUrl = await getPresignedDownloadUrl(w.imageKey);
        return {
          id: w.id,
          eventId: w.eventId,
          eventName: eventMap.get(w.eventId) || "Unknown Event",
          guestName: w.guestName,
          wish: w.message, // Renamed from wish -> message
          imageUrl: downloadUrl,
          time: formatTimeAgo(w.createdAt),
          type: w.message ? ("wish" as const) : ("photo" as const),
        };
      })
    );

    return mappedWishes;
  } catch (error) {
    console.error("Failed to get recent submissions:", error);
    return [];
  }
}

import { getAllUsersForAdmin as localGetAllUsersForAdmin } from "../(dashboard)/dashboard/admin/_actions/admin-actions";

export async function getAllUsersForAdmin() {
  return localGetAllUsersForAdmin();
}



// Activity logger helper
export async function logActivity(action: string, details?: string) {
  const { data: session } = await auth.getSession();
  const userId = session?.user?.id || null;
  const id = `log-${Math.random().toString(36).substring(2, 11)}`;

  try {
    await db.insert(logs).values({
      id,
      userId,
      action,
      metadata: details, // Renamed details -> metadata
    });
  } catch (error) {
    console.error("Failed to write activity log:", error);
  }
}

// Update user profile display name
export async function updateProfile(data: { name: string }) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .update(users)
      .set({ name: data.name })
      .where(eq(users.id, session.user.id));

    await logActivity(
      "update_profile",
      `Updated profile display name to "${data.name}"`
    );

    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to update profile:", error);
    return { error: error.message || "Failed to update profile." };
  }
}
