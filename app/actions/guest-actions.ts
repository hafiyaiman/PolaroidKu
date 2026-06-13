"use server";

import { db, events, wishes } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getPresignedUploadUrl } from "@/lib/storage/r2";
import crypto from "crypto";

export async function getPublicEventDetails(eventId: string) {
  try {
    const [event] = await db
      .select({
        id: events.id,
        name: events.name,
        date: events.date,
        status: events.status,
        welcomeMessage: events.welcomeMessage,
      })
      .from(events)
      .where(eq(events.id, eventId));

    if (!event) {
      return { error: "Event not found." };
    }

    if (event.status !== "Active") {
      return { error: "This event guestbook is not active." };
    }

    return { success: true, event };
  } catch (error: any) {
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

    if (event.status !== "Active") {
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
  } catch (error: any) {
    console.error("Failed to generate presigned upload URL for guest:", error);
    return { error: "Failed to initialize upload session. Please try again." };
  }
}

export async function submitGuestWish(data: {
  eventId: string;
  guestName: string;
  wish: string;
  imageKey: string;
}) {
  try {
    // 1. Basic validation
    if (!data.guestName.trim()) {
      return { error: "Guest name is required." };
    }
    if (!data.wish.trim()) {
      return { error: "Wish is required." };
    }
    if (!data.imageKey) {
      return { error: "Photo upload is required." };
    }

    // 2. Insert wish
    const wishId = crypto.randomUUID();
    await db.insert(wishes).values({
      id: wishId,
      eventId: data.eventId,
      guestName: data.guestName.trim(),
      wish: data.wish.trim(),
      imageKey: data.imageKey,
    });

    return { success: true, wishId };
  } catch (error: any) {
    console.error("Failed to submit guestbook wish:", error);
    return { error: "Failed to save your guestbook entry. Please try again." };
  }
}
