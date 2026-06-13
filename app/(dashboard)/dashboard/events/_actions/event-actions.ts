"use server";

import { db, events, wishes, logs } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { eq, and, count, desc } from "drizzle-orm";
import { getPresignedDownloadUrl } from "@/lib/storage/r2";

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
      details,
    });
  } catch (error) {
    console.error("Failed to write activity log:", error);
  }
}

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

    await logActivity(
      "create_event",
      `Created event "${data.name}" with ID "${uniqueId}" on plan "${plan}"`
    );

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
    console.error("Failed to fetch user events:", error);
    return [];
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
