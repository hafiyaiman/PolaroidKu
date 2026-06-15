"use server";

import { db, events, submissions, users, logs } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { eq, count, desc } from "drizzle-orm";
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

    // 2. Count submissions from all user's events
    const userEvents = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.userId, session.user.id));

    let totalWishes = 0;
    if (userEvents.length > 0) {
      const eventIds = userEvents.map((e) => e.id);
      for (const eventId of eventIds) {
        const [wishesCount] = await db
          .select({ value: count() })
          .from(submissions)
          .where(eq(submissions.eventId, eventId));
        totalWishes += wishesCount?.value || 0;
      }
    }

    // Storage: Fetch actual R2 storage size in bytes and format it
    const actualBytes = await getUserStorageSize(session.user.id);
    const storageUsed = formatBytes(actualBytes);

    // Determine account role/tier
    const activeTier = session.user.role === "admin" ? "Super Admin" : "Free Plan";

    return {
      totalEvents: eventsCount?.value || 0,
      totalWishes,
      storageUsed,
      activeTier,
    };
  } catch (error) {
    console.error("Failed to calculate dashboard stats:", error);
    return {
      totalEvents: 0,
      totalWishes: 0,
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
    let allRecentWishes: DbSubmission[] = [];
    for (const eventId of eventIds) {
      const recentWishes = await db
        .select()
        .from(submissions)
        .where(eq(submissions.eventId, eventId))
        .orderBy(desc(submissions.createdAt))
        .limit(3);
      allRecentWishes.push(...recentWishes);
    }

    // Sort combined submissions by creation date desc and limit to 3
    allRecentWishes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    allRecentWishes = allRecentWishes.slice(0, 3);

    const mappedWishes = await Promise.all(
      allRecentWishes.map(async (w) => {
        const downloadUrl = await getPresignedDownloadUrl(w.imageKey);
        return {
          id: w.id,
          eventName: eventMap.get(w.eventId) || "Unknown Event",
          guestName: w.guestName,
          wish: w.message, // Renamed from wish -> message
          imageUrl: downloadUrl,
          time: formatTimeAgo(w.createdAt),
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
