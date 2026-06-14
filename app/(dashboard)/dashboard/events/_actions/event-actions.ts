"use server";

import { db, events, wishes, logs } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { eq, and, count, desc } from "drizzle-orm";
import { getPresignedDownloadUrl, deleteObjectFromR2, deleteEventFolderFromR2 } from "@/lib/storage/r2";


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
  id?: string;
  name: string;
  date: string;
  welcomeMessage?: string;
  plan?: EventPlan;
  template?: string;
  coverImageKey?: string;
  preheader?: string;
  subheader?: string;
  buttonShape?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  bgColor?: string;
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
  const uniqueId = data.id || `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

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
      template: data.template || "classic",
      coverImageKey: data.coverImageKey || null,
      preheader: data.preheader || "Our Guestbook",
      subheader: data.subheader || null,
      buttonShape: data.buttonShape || "rounded",
      textColor: data.textColor || "#0F172A",
      buttonColor: data.buttonColor || "#0F172A",
      buttonTextColor: data.buttonTextColor || "#FFFFFF",
      bgColor: data.bgColor || "#FAF9F5",
    });

    await logActivity(
      "create_event",
      `Created event "${data.name}" with ID "${uniqueId}" on plan "${plan}"`
    );

    return { success: true, eventId: uniqueId };
  } catch (err) {
    const error = err as Error;
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

    let coverImageUrl = "";
    if (event.coverImageKey) {
      try {
        coverImageUrl = await getPresignedDownloadUrl(event.coverImageKey);
      } catch (err) {
        console.error("Failed to sign cover image URL:", err);
      }
    }

    return {
      success: true,
      event: {
        ...event,
        coverImageUrl,
      },
      submissions: wishesWithDownloadUrls,
    };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to get event details:", error);
    return { error: error.message || "Failed to load event details." };
  }
}

export async function updateEventDetails(
  eventId: string,
  data: {
    name?: string;
    date?: string;
    welcomeMessage?: string;
    status?: "Active" | "Archived" | "Draft";
    template?: string;
    coverImageKey?: string;
    preheader?: string;
    subheader?: string;
    buttonShape?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    bgColor?: string;
  }
) {
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
      return { error: "Event not found or unauthorized." };
    }

    const updateData: Partial<typeof events.$inferInsert> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.welcomeMessage !== undefined) updateData.welcomeMessage = data.welcomeMessage;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.template !== undefined) updateData.template = data.template;
    if (data.coverImageKey !== undefined) updateData.coverImageKey = data.coverImageKey;
    if (data.preheader !== undefined) updateData.preheader = data.preheader;
    if (data.subheader !== undefined) updateData.subheader = data.subheader;
    if (data.buttonShape !== undefined) updateData.buttonShape = data.buttonShape;
    if (data.textColor !== undefined) updateData.textColor = data.textColor;
    if (data.buttonColor !== undefined) updateData.buttonColor = data.buttonColor;
    if (data.buttonTextColor !== undefined) updateData.buttonTextColor = data.buttonTextColor;
    if (data.bgColor !== undefined) updateData.bgColor = data.bgColor;

    await db.update(events).set(updateData).where(eq(events.id, eventId));

    await logActivity("update_event", `Updated settings for event "${event.name}" (${eventId})`);

    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to update event details:", error);
    return { error: error.message || "Failed to update event details." };
  }
}

export async function requestCoverUploadUrl(data: {
  eventId: string;
  filename: string;
  contentType: string;
  isNewEvent?: boolean;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    if (!data.isNewEvent) {
      const [event] = await db
        .select({ userId: events.userId })
        .from(events)
        .where(and(eq(events.id, data.eventId), eq(events.userId, session.user.id)));

      if (!event) {
        return { error: "Event not found or unauthorized." };
      }
    }

    const { getPresignedUploadUrl } = await import("@/lib/storage/r2");
    
    // Construct key under user prefix
    const sanitizedFilename = `cover-${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { uploadUrl, key } = await getPresignedUploadUrl(
      session.user.id,
      data.eventId,
      sanitizedFilename,
      data.contentType
    );

    return { success: true, uploadUrl, key };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to generate cover upload URL:", error);
    return { error: "Failed to initialize upload session." };
  }
}

export async function deleteEventAction(eventId: string) {
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
      return { error: "Event not found or unauthorized." };
    }

    // Delete folder from R2
    await deleteEventFolderFromR2(session.user.id, eventId);

    // Delete from DB (cascade deletes wishes)
    await db.delete(events).where(eq(events.id, eventId));

    await logActivity("delete_event", `Deleted event "${event.name}" (${eventId})`);

    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to delete event:", error);
    return { error: error.message || "Failed to delete event." };
  }
}

export async function deleteSubmissionAction(eventId: string, submissionId: string) {
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
      return { error: "Event not found or unauthorized." };
    }

    const [submission] = await db
      .select()
      .from(wishes)
      .where(and(eq(wishes.id, submissionId), eq(wishes.eventId, eventId)));

    if (!submission) {
      return { error: "Submission not found." };
    }

    if (submission.imageKey) {
      await deleteObjectFromR2(submission.imageKey);
    }

    await db.delete(wishes).where(eq(wishes.id, submissionId));

    const newCount = Math.max(0, event.photoCount - 1);
    await db.update(events).set({ photoCount: newCount }).where(eq(events.id, eventId));

    await logActivity(
      "delete_submission",
      `Deleted submission by "${submission.guestName}" for event "${event.name}"`
    );

    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to delete submission:", error);
    return { error: error.message || "Failed to delete submission." };
  }
}

