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
  const isUserAdmin = (session?.user as any)?.role === "admin" || session?.user?.email?.includes("admin");
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
  const isUserAdmin = (session?.user as any)?.role === "admin" || session?.user?.email?.includes("admin");
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
  const isUserAdmin = (session?.user as any)?.role === "admin" || session?.user?.email?.includes("admin");
  if (!isUserAdmin) {
    return { error: "Unauthorized" };
  }

  if (session?.user?.id === userId) {
    return { error: "You cannot ban yourself" };
  }

  const actualReason = reason || "Banned by Administrator";

  try {
    const { error } = await (auth as any).admin.banUser({
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
  const isUserAdmin = (session?.user as any)?.role === "admin" || session?.user?.email?.includes("admin");
  if (!isUserAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const { error } = await (auth as any).admin.unbanUser({ userId });
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
  const isUserAdmin = (session?.user as any)?.role === "admin" || session?.user?.email?.includes("admin");
  if (!isUserAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    // Call Neon Auth server-side setRole API
    const { error } = await (auth as any).admin.setRole({
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

