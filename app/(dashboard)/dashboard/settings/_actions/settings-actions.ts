"use server";

import { db, userSettings, events, logs } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { eq } from "drizzle-orm";
import { getUserStorageSize } from "@/lib/storage/r2";
import { logActivity } from "../../events/_actions/event-actions";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    let [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    if (!settings) {
      const newSettings = {
        userId,
        phoneNumber: "",
        defaultEventVisibility: "public" as const,
        defaultTheme: "dark" as const,
        notifyOnUpload: true,
        notifyOnLimit: true,
        notifyOnExpiry: true,
        notifyOnReceipt: true,
      };
      await db.insert(userSettings).values(newSettings);
      settings = {
        ...newSettings,
        updatedAt: new Date(),
      };
    }

    return { success: true, settings, user: session.user };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to get settings:", error);
    return { error: error.message || "Failed to load settings." };
  }
}

export async function updateProfileSettings(data: {
  name: string;
  phoneNumber?: string;
  image?: string;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  try {
    const authRes = await auth.updateUser({
      name: data.name,
      image: data.image,
    });

    if (authRes.error) {
      return { error: authRes.error.message || "Failed to update auth profile." };
    }

    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    if (!settings) {
      await db.insert(userSettings).values({
        userId,
        phoneNumber: data.phoneNumber || "",
        defaultEventVisibility: "public",
        defaultTheme: "dark",
        notifyOnUpload: true,
        notifyOnLimit: true,
        notifyOnExpiry: true,
        notifyOnReceipt: true,
      });
    } else {
      await db
        .update(userSettings)
        .set({
          phoneNumber: data.phoneNumber || "",
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, userId));
    }

    await logActivity("update_profile", `Updated display name to "${data.name}" and avatar/phone.`);
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to update profile settings:", error);
    return { error: error.message || "Failed to update profile." };
  }
}

export async function updateNotificationSettings(data: {
  notifyOnUpload?: boolean;
  notifyOnLimit?: boolean;
  notifyOnExpiry?: boolean;
  notifyOnReceipt?: boolean;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  try {
    await db
      .update(userSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId));

    await logActivity("update_notifications", "Updated email notification settings.");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to update notifications:", error);
    return { error: error.message || "Failed to update notifications." };
  }
}

export async function updatePreferences(data: {
  defaultEventVisibility?: "public" | "private";
  defaultTheme?: "dark" | "light" | "system";
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  try {
    await db
      .update(userSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId));

    await logActivity(
      "update_preferences",
      `Updated default visibility to "${data.defaultEventVisibility}" and theme to "${data.defaultTheme}"`
    );
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to update preferences:", error);
    return { error: error.message || "Failed to update preferences." };
  }
}

export async function changePasswordAction(data: {
  currentPassword?: string;
  newPassword?: string;
  revokeOtherSessions?: boolean;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  if (!data.currentPassword || !data.newPassword) {
    return { error: "Missing passwords." };
  }

  try {
    const { error } = await auth.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: data.revokeOtherSessions ?? false,
    });

    if (error) {
      return { error: error.message || "Failed to change password." };
    }

    await logActivity("change_password", "Changed account password.");
    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to change password:", error);
    return { error: error.message || "Failed to change password." };
  }
}

export async function getSessionsAction() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const { data: sessions, error } = await auth.listSessions();
    if (error) {
      return { error: error.message || "Failed to fetch active sessions." };
    }

    return { success: true, sessions };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to list sessions:", error);
    return { error: error.message || "Failed to list sessions." };
  }
}

export async function revokeSessionAction(tokenOrId: string) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const { error } = await auth.revokeSession({ token: tokenOrId });
    if (error) {
      return { error: error.message || "Failed to revoke session." };
    }

    await logActivity("revoke_session", `Revoked active session`);
    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to revoke session:", error);
    return { error: error.message || "Failed to revoke session." };
  }
}

export async function revokeOtherSessionsAction() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const { error } = await auth.revokeOtherSessions();
    if (error) {
      return { error: error.message || "Failed to revoke other sessions." };
    }

    await logActivity("revoke_other_sessions", "Revoked all other active sessions.");
    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to revoke other sessions:", error);
    return { error: error.message || "Failed to revoke other sessions." };
  }
}

export async function getUsageMetrics() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  try {
    const userEvents = await db
      .select()
      .from(events)
      .where(eq(events.userId, userId));

    const totalEvents = userEvents.length;
    let totalPhotos = 0;
    let activeEvents = 0;
    let expiredEvents = 0;

    const now = new Date();

    for (const event of userEvents) {
      totalPhotos += event.photoCount;
      const isExpired = event.expiresAt ? new Date(event.expiresAt) < now : false;
      
      if (event.status === "Active" && !isExpired) {
        activeEvents++;
      } else {
        expiredEvents++;
      }
    }

    const totalStorageBytes = await getUserStorageSize(userId);

    return {
      success: true,
      metrics: {
        totalEvents,
        totalPhotos,
        totalStorageBytes,
        activeEvents,
        expiredEvents,
      },
    };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to fetch usage metrics:", error);
    return { error: error.message || "Failed to load usage metrics." };
  }
}

export async function deleteAccountAction() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  try {
    await db.delete(userSettings).where(eq(userSettings.userId, userId));
    await db.delete(events).where(eq(events.userId, userId));
    await db.delete(logs).where(eq(logs.userId, userId));

    const authRes = await auth.deleteUser();
    if (authRes.error) {
      return { error: authRes.error.message || "Failed to delete auth user." };
    }

    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to delete account:", error);
    return { error: error.message || "Failed to delete account." };
  }
}
