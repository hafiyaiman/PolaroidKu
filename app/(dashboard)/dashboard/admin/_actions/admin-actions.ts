"use server";

import { db, users, events } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { eq, count, desc } from "drizzle-orm";
import { getUserStorageSize } from "@/lib/storage/r2";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function getAllUsersForAdmin() {
  const { data: session } = await auth.getSession();
  const isUserAdmin = session?.user?.role === "admin" || session?.user?.email?.includes("admin");
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
