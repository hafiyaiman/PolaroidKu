"use server";

import { db, events, wishes, users } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { eq, and, count, desc } from "drizzle-orm";
import { getPresignedDownloadUrl } from "@/lib/storage/r2";
import { redirect } from "next/navigation";

// Helper to sanitize/slugify event names for IDs
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-") // collapse dashes
    .trim();
}

// Plan config — single source of truth
const PLAN_LIMITS = {
  free:    { photoLimit: 50,   retentionDays: 30  },
  premium: { photoLimit: 1000, retentionDays: 90  },
  pro:     { photoLimit: 3000, retentionDays: 180 },
} as const;

type EventPlan = keyof typeof PLAN_LIMITS;

export async function createEvent(data: {
  name: string;
  date: string;
  welcomeMessage?: string;
  plan?: EventPlan;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const plan: EventPlan = data.plan ?? "free";
  const { photoLimit, retentionDays } = PLAN_LIMITS[plan];

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + retentionDays);

  const baseSlug = slugify(data.name) || "event";
  const uniqueId = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

  try {
    await db.insert(events).values({
      id: uniqueId,
      name: data.name,
      date: data.date,
      userId: session.user.id,
      welcomeMessage: data.welcomeMessage || "Welcome to our Guestbook! Snap a photo and leave a wish.",
      status: "Active",
      plan,
      photoLimit,
      photoCount: 0,
      retentionDays,
      expiresAt,
    });
    return { success: true, eventId: uniqueId };
  } catch (error: any) {
    console.error("Failed to create event:", error);
    return { error: error.message || "Failed to create event." };
  }
}

export async function getUserEvents() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return [];
  }

  try {
    // Fetch user events
    const userEvents = await db
      .select()
      .from(events)
      .where(eq(events.userId, session.user.id))
      .orderBy(desc(events.createdAt));

    // Get count of wishes per event
    const eventsWithCount = await Promise.all(
      userEvents.map(async (event) => {
        const [wishCountResult] = await db
          .select({ value: count() })
          .from(wishes)
          .where(eq(wishes.eventId, event.id));
        
        return {
          ...event,
          guestCount: wishCountResult?.value || 0,
        };
      })
    );

    return eventsWithCount;
  } catch (error) {
    console.error("Failed to get user events:", error);
    return [];
  }
}

export async function getEventDetails(eventId: string) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.userId, session.user.id)));

    if (!event) {
      return { error: "Event not found" };
    }

    const eventWishes = await db
      .select()
      .from(wishes)
      .where(eq(wishes.eventId, eventId))
      .orderBy(desc(wishes.createdAt));

    // Generate secure pre-signed download URLs for each wish photo
    const wishesWithDownloadUrls = await Promise.all(
      eventWishes.map(async (w) => {
        try {
          const downloadUrl = await getPresignedDownloadUrl(w.imageKey);
          return {
            id: w.id,
            guestName: w.guestName,
            wish: w.wish,
            imageUrl: downloadUrl,
            time: formatTimeAgo(w.createdAt),
          };
        } catch (err) {
          console.error(`Failed to sign download URL for key ${w.imageKey}:`, err);
          return {
            id: w.id,
            guestName: w.guestName,
            wish: w.wish,
            imageUrl: "",
            time: formatTimeAgo(w.createdAt),
          };
        }
      })
    );

    return {
      success: true,
      event,
      submissions: wishesWithDownloadUrls,
    };
  } catch (error: any) {
    console.error("Failed to get event details:", error);
    return { error: error.message || "Failed to load event details." };
  }
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

    // 2. Count wishes from all user's events
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
          .from(wishes)
          .where(eq(wishes.eventId, eventId));
        totalWishes += wishesCount?.value || 0;
      }
    }

    // Storage: Mock a realistic size since R2 doesn't expose total key size in S3 easily
    const storageUsed = totalWishes > 0 
      ? `${(totalWishes * 0.35).toFixed(1)} MB` // Approx 350KB per photo
      : "0 MB";

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

    // Fetch recent wishes across all user events
    let allRecentWishes: any[] = [];
    for (const eventId of eventIds) {
      const recentWishes = await db
        .select()
        .from(wishes)
        .where(eq(wishes.eventId, eventId))
        .orderBy(desc(wishes.createdAt))
        .limit(3);
      allRecentWishes.push(...recentWishes);
    }

    // Sort combined wishes by creation date desc and limit to 3
    allRecentWishes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    allRecentWishes = allRecentWishes.slice(0, 3);

    const mappedWishes = await Promise.all(
      allRecentWishes.map(async (w) => {
        const downloadUrl = await getPresignedDownloadUrl(w.imageKey);
        return {
          id: w.id,
          eventName: eventMap.get(w.eventId) || "Unknown Event",
          guestName: w.guestName,
          wish: w.wish,
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

export async function getAllUsersForAdmin() {
  const { data: session } = await auth.getSession();
  // Role checks: allow if email has admin or role is admin
  const isUserAdmin = session?.user?.role === "admin" || session?.user?.email?.includes("admin");
  if (!isUserAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    // Select users from neon_auth.user schema
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

    const usersWithStats = await Promise.all(
      allUsers.map(async (u) => {
        // Count events created by this user
        const [eventCountResult] = await db
          .select({ value: count() })
          .from(events)
          .where(eq(events.userId, u.id));

        const userEvents = await db
          .select({ id: events.id })
          .from(events)
          .where(eq(events.userId, u.id));

        let wishesCount = 0;
        if (userEvents.length > 0) {
          const ids = userEvents.map(e => e.id);
          for (const id of ids) {
            const [c] = await db.select({ value: count() }).from(wishes).where(eq(wishes.eventId, id));
            wishesCount += c?.value || 0;
          }
        }

        return {
          id: u.id,
          name: u.name || "Anonymous User",
          email: u.email,
          role: u.role || "user",
          eventsCount: eventCountResult?.value || 0,
          bucketSize: wishesCount > 0 ? `${(wishesCount * 0.35).toFixed(1)} MB` : "0 MB",
        };
      })
    );

    return { success: true, users: usersWithStats };
  } catch (error: any) {
    console.error("Failed to fetch admin users directory:", error);
    return { error: error.message || "Failed to load users." };
  }
}

// Utility to format timestamp to human-friendly text
function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval === 1 ? "1 day ago" : `${interval} days ago`;
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  
  if (seconds < 10) return "just now";
  return `${Math.floor(seconds)} seconds ago`;
}
