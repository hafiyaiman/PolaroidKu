"use server";

import { db, events, submissions, eventSettings, eventBorders } from "@/lib/db";
import { eq, or, and, desc } from "drizzle-orm";
import { getPresignedUploadUrl } from "@/lib/storage/r2";
import crypto from "crypto";

export async function getPublicEventDetails(eventIdOrSlug: string) {
  try {
    const [row] = await db
      .select({
        id: events.id,
        name: events.name,
        date: events.date,
        status: events.status,
        slug: events.slug,
        template: eventSettings.template,
        coverImageKey: eventSettings.coverImageKey,
        preheader: eventSettings.preheader,
        subheader: eventSettings.subheader,
        buttonShape: eventSettings.buttonShape,
        textColor: eventSettings.textColor,
        buttonColor: eventSettings.buttonColor,
        buttonTextColor: eventSettings.buttonTextColor,
        bgColor: eventSettings.bgColor,
        preheaderColor: eventSettings.preheaderColor,
        subheaderColor: eventSettings.subheaderColor,
        showPublicGallery: eventSettings.showPublicGallery,
      })
      .from(events)
      .leftJoin(eventSettings, eq(events.id, eventSettings.eventId))
      .where(or(eq(events.id, eventIdOrSlug), eq(events.slug, eventIdOrSlug)));

    if (!row) {
      return { error: "Event not found." };
    }

    if (row.status !== "published") {
      return { error: "This event guestbook is not active." };
    }

    const { getPresignedDownloadUrl } = await import("@/lib/storage/r2");

    let coverImageUrl = "";
    if (row.coverImageKey) {
      try {
        coverImageUrl = await getPresignedDownloadUrl(row.coverImageKey);
      } catch (err) {
        console.error("Failed to sign public cover image URL:", err);
      }
    }

    // 1. Fetch custom borders
    const customBordersList = await db
      .select()
      .from(eventBorders)
      .where(eq(eventBorders.eventId, row.id))
      .orderBy(desc(eventBorders.createdAt));

    const bordersWithDownloadUrls = await Promise.all(
      customBordersList.map(async (b) => {
        try {
          const downloadUrl = await getPresignedDownloadUrl(b.imageKey);
          return {
            id: b.id,
            name: b.name,
            imageKey: b.imageKey,
            layoutType: b.layoutType,
            photoAlign: b.photoAlign,
            imageUrl: downloadUrl,
          };
        } catch (err) {
          console.error(`Failed to sign download URL for public border ${b.imageKey}:`, err);
          return {
            id: b.id,
            name: b.name,
            imageKey: b.imageKey,
            layoutType: b.layoutType,
            photoAlign: b.photoAlign,
            imageUrl: "",
          };
        }
      })
    );

    // 2. Fetch public submissions
    let guestSubmissions: {
      id: string;
      guestName: string | null;
      wish: string | null;
      imageUrl: string;
      time: string;
    }[] = [];
    if (row.showPublicGallery) {
      const dbSubmissions = await db
        .select()
        .from(submissions)
        .where(and(eq(submissions.eventId, row.id), eq(submissions.status, "visible")))
        .orderBy(desc(submissions.createdAt));

      const { formatTimeAgo } = await import("@/lib/format");
      guestSubmissions = await Promise.all(
        dbSubmissions.map(async (s) => {
          try {
            const downloadUrl = await getPresignedDownloadUrl(s.imageKey);
            return {
              id: s.id,
              guestName: s.guestName || "Anonymous",
              wish: s.message || "",
              imageUrl: downloadUrl,
              time: formatTimeAgo(s.createdAt),
            };
          } catch (err) {
            console.error(`Failed to sign download URL for public submission ${s.imageKey}:`, err);
            return {
              id: s.id,
              guestName: s.guestName || "Anonymous",
              wish: s.message || "",
              imageUrl: "",
              time: formatTimeAgo(s.createdAt),
            };
          }
        })
      );
    }

    return { 
      success: true, 
      event: {
        ...row,
        coverImageUrl
      },
      borders: bordersWithDownloadUrls,
      submissions: guestSubmissions,
    };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to load public event details:", error);
    return { error: "Failed to load event details." };
  }
}

export async function requestGuestUploadUrl(data: {
  eventId: string;
  filename: string;
  contentType: string;
}) {
  try {
    // 1. Fetch event to verify it exists and get the owner's userId
    const [event] = await db
      .select({
        userId: events.userId,
        status: events.status,
      })
      .from(events)
      .where(eq(events.id, data.eventId));

    if (!event) {
      return { error: "Event not found." };
    }

    if (event.status !== "published") {
      return { error: "This event guestbook is not active." };
    }

    // 2. Generate secure presigned upload URL from R2
    const { uploadUrl, key } = await getPresignedUploadUrl(
      event.userId,
      data.eventId,
      data.filename,
      data.contentType
    );

    return { success: true, uploadUrl, key };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to generate presigned upload URL for guest:", error);
    return { error: "Failed to initialize upload session. Please try again." };
  }
}

export async function submitGuestSubmission(data: {
  eventId: string;
  guestName?: string;
  message?: string;
  imageKey: string;
  imageSize?: number;
  mimeType?: string;
}) {
  try {
    // Basic validation
    if (!data.imageKey) {
      return { error: "Photo upload is required." };
    }

    const submissionId = crypto.randomUUID();

    // Perform database calls sequentially
    // 1. Insert guest submission record
    await db.insert(submissions).values({
      id: submissionId,
      eventId: data.eventId,
      guestName: data.guestName ? data.guestName.trim() : null,
      message: data.message ? data.message.trim() : null,
      imageKey: data.imageKey,
      imageSize: data.imageSize || null,
      mimeType: data.mimeType || null,
      status: "visible",
    });

    // 2. Load current counts
    const [event] = await db
      .select({
        photoCount: events.photoCount,
        storageUsedBytes: events.storageUsedBytes,
      })
      .from(events)
      .where(eq(events.id, data.eventId));

    if (event) {
      // 3. Update counter statistics
      await db
        .update(events)
        .set({
          photoCount: event.photoCount + 1,
          storageUsedBytes: event.storageUsedBytes + (data.imageSize || 0),
          updatedAt: new Date(),
        })
        .where(eq(events.id, data.eventId));
    }

    return { success: true, submissionId };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to submit guestbook entry:", error);
    return { error: "Failed to save your guestbook entry. Please try again." };
  }
}
