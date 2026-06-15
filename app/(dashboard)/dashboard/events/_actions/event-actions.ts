"use server";

import { db, events, submissions, eventSettings, logs } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { eq, and, count, desc } from "drizzle-orm";
import { getPresignedDownloadUrl, deleteObjectFromR2, deleteEventFolderFromR2 } from "@/lib/storage/r2";
import { formatTimeAgo } from "@/lib/format";

// Helper to sanitize/slugify event names for IDs/slugs
function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

// Plan config — single source of truth
const PLAN_LIMITS = {
  free:    { photoLimit: 50,   retentionDays: 30  },
  premium: { photoLimit: 1000, retentionDays: 90  },
  pro:     { photoLimit: 3000, retentionDays: 180 },
} as const;

type EventPlan = keyof typeof PLAN_LIMITS;

// Activity logger helper
export async function logActivity(action: string, details?: string, entityType?: string, entityId?: string) {
  const { data: session } = await auth.getSession();
  const userId = session?.user?.id || null;
  const id = `log-${Math.random().toString(36).substring(2, 11)}`;

  try {
    await db.insert(logs).values({
      id,
      userId,
      action,
      entityType: entityType || null,
      entityId: entityId || null,
      metadata: details || null,
    });
  } catch (error) {
    console.error("Failed to write activity log:", error);
  }
}

export async function createEvent(data: {
  id?: string;
  name: string;
  date: string;
  plan?: EventPlan;
  status?: "draft" | "published" | "expired" | "archived";
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
  
  // Ensure slug uniqueness by adding a small unique string
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  try {
    await db.transaction(async (tx) => {
      // 1. Create base event record
      await tx.insert(events).values({
        id: uniqueId,
        name: data.name,
        slug: slug,
        date: data.date,
        userId: session.user.id,
        status: data.status || "draft",
        plan,
        photoLimit,
        photoCount: 0,
        storageUsedBytes: 0,
        retentionDays,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 2. Create matching event settings customizer record
      await tx.insert(eventSettings).values({
        eventId: uniqueId,
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
    });

    await logActivity(
      "create",
      `Created event "${data.name}" with ID "${uniqueId}" on plan "${plan}"`,
      "event",
      uniqueId
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
    // Fetch user events joined with their settings
    const userEvents = await db
      .select({
        id: events.id,
        name: events.name,
        slug: events.slug,
        date: events.date,
        userId: events.userId,
        status: events.status,
        plan: events.plan,
        photoLimit: events.photoLimit,
        photoCount: events.photoCount,
        storageUsedBytes: events.storageUsedBytes,
        retentionDays: events.retentionDays,
        expiresAt: events.expiresAt,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        template: eventSettings.template,
        coverImageKey: eventSettings.coverImageKey,
        preheader: eventSettings.preheader,
        subheader: eventSettings.subheader,
        buttonShape: eventSettings.buttonShape,
        textColor: eventSettings.textColor,
        buttonColor: eventSettings.buttonColor,
        buttonTextColor: eventSettings.buttonTextColor,
        bgColor: eventSettings.bgColor,
        pendingPurchaseId: events.pendingPurchaseId,
      })
      .from(events)
      .leftJoin(eventSettings, eq(events.id, eventSettings.eventId))
      .where(eq(events.userId, session.user.id))
      .orderBy(desc(events.createdAt));

    // Get count of submissions per event
    const eventsWithCount = await Promise.all(
      userEvents.map(async (event) => {
        const [submissionCountResult] = await db
          .select({ value: count() })
          .from(submissions)
          .where(eq(submissions.eventId, event.id));
        
        return {
          ...event,
          guestCount: submissionCountResult?.value || 0,
        };
      })
    );

    return eventsWithCount;
  } catch (error) {
    console.error("Failed to fetch user events:", error);
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
      .select({
        id: events.id,
        name: events.name,
        slug: events.slug,
        date: events.date,
        userId: events.userId,
        status: events.status,
        plan: events.plan,
        photoLimit: events.photoLimit,
        photoCount: events.photoCount,
        storageUsedBytes: events.storageUsedBytes,
        retentionDays: events.retentionDays,
        expiresAt: events.expiresAt,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        template: eventSettings.template,
        coverImageKey: eventSettings.coverImageKey,
        preheader: eventSettings.preheader,
        subheader: eventSettings.subheader,
        buttonShape: eventSettings.buttonShape,
        textColor: eventSettings.textColor,
        buttonColor: eventSettings.buttonColor,
        buttonTextColor: eventSettings.buttonTextColor,
        bgColor: eventSettings.bgColor,
        pendingPurchaseId: events.pendingPurchaseId,
      })
      .from(events)
      .leftJoin(eventSettings, eq(events.id, eventSettings.eventId))
      .where(and(eq(events.id, eventId), eq(events.userId, session.user.id)));

    if (!event) {
      return { error: "Event not found" };
    }

    const eventSubmissions = await db
      .select()
      .from(submissions)
      .where(eq(submissions.eventId, eventId))
      .orderBy(desc(submissions.createdAt));

    // Generate secure pre-signed download URLs for each submission photo
    const submissionsWithDownloadUrls = await Promise.all(
      eventSubmissions.map(async (w) => {
        try {
          const downloadUrl = await getPresignedDownloadUrl(w.imageKey);
          return {
            id: w.id,
            guestName: w.guestName || "Anonymous",
            wish: w.message || "", // Return w.message mapped to wish for UI compatibility
            imageUrl: downloadUrl,
            time: formatTimeAgo(w.createdAt),
          };
        } catch (err) {
          console.error(`Failed to sign download URL for key ${w.imageKey}:`, err);
          return {
            id: w.id,
            guestName: w.guestName || "Anonymous",
            wish: w.message || "",
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
      submissions: submissionsWithDownloadUrls,
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
    status?: "draft" | "published" | "expired" | "archived";
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

    const updateEventData: Partial<typeof events.$inferInsert> = {};
    if (data.name !== undefined) updateEventData.name = data.name;
    if (data.date !== undefined) updateEventData.date = data.date;
    if (data.status !== undefined) updateEventData.status = data.status;
    updateEventData.updatedAt = new Date();

    const updateSettingsData: Partial<typeof eventSettings.$inferInsert> = {};
    if (data.template !== undefined) updateSettingsData.template = data.template;
    if (data.coverImageKey !== undefined) updateSettingsData.coverImageKey = data.coverImageKey;
    if (data.preheader !== undefined) updateSettingsData.preheader = data.preheader;
    if (data.subheader !== undefined) updateSettingsData.subheader = data.subheader;
    if (data.buttonShape !== undefined) updateSettingsData.buttonShape = data.buttonShape;
    if (data.textColor !== undefined) updateSettingsData.textColor = data.textColor;
    if (data.buttonColor !== undefined) updateSettingsData.buttonColor = data.buttonColor;
    if (data.buttonTextColor !== undefined) updateSettingsData.buttonTextColor = data.buttonTextColor;
    if (data.bgColor !== undefined) updateSettingsData.bgColor = data.bgColor;

    // Apply updates inside a transaction to keep event and event settings tables synced
    await db.transaction(async (tx) => {
      if (Object.keys(updateEventData).length > 0) {
        await tx.update(events).set(updateEventData).where(eq(events.id, eventId));
      }
      if (Object.keys(updateSettingsData).length > 0) {
        await tx
          .insert(eventSettings)
          .values({ eventId, ...updateSettingsData })
          .onConflictDoUpdate({
            target: eventSettings.eventId,
            set: updateSettingsData,
          });
      }
    });

    await logActivity("update", `Updated settings for event "${event.name}" (${eventId})`, "event", eventId);

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

    // Delete from DB (cascade deletes eventSettings and submissions)
    await db.delete(events).where(eq(events.id, eventId));

    await logActivity("delete", `Deleted event "${event.name}" (${eventId})`, "event", eventId);

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
      .from(submissions)
      .where(and(eq(submissions.id, submissionId), eq(submissions.eventId, eventId)));

    if (!submission) {
      return { error: "Submission not found." };
    }

    if (submission.imageKey) {
      await deleteObjectFromR2(submission.imageKey);
    }

    // Decrement counters inside a transaction
    await db.transaction(async (tx) => {
      await tx.delete(submissions).where(eq(submissions.id, submissionId));

      const newCount = Math.max(0, event.photoCount - 1);
      const newStorage = Math.max(0, event.storageUsedBytes - (submission.imageSize || 0));

      await tx
        .update(events)
        .set({
          photoCount: newCount,
          storageUsedBytes: newStorage,
          updatedAt: new Date(),
        })
        .where(eq(events.id, eventId));
    });

    await logActivity(
      "delete",
      `Deleted submission by "${submission.guestName}" for event "${event.name}"`,
      "submission",
      submissionId
    );

    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to delete submission:", error);
    return { error: error.message || "Failed to delete submission." };
  }
}
