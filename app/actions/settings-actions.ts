"use server";

import {
  getSettings as localGetSettings,
  updateProfileSettings as localUpdateProfileSettings,
  updateNotificationSettings as localUpdateNotificationSettings,
  updatePreferences as localUpdatePreferences,
  changePasswordAction as localChangePasswordAction,
  getSessionsAction as localGetSessionsAction,
  revokeSessionAction as localRevokeSessionAction,
  revokeOtherSessionsAction as localRevokeOtherSessionsAction,
  getUsageMetrics as localGetUsageMetrics,
  deleteAccountAction as localDeleteAccountAction
} from "../(dashboard)/dashboard/settings/_actions/settings-actions";

import { upgradeEventAction as localUpgradeEventAction } from "../(dashboard)/dashboard/billing/_actions/billing-actions";

export async function getSettings() {
  return localGetSettings();
}

export async function updateProfileSettings(data: Parameters<typeof localUpdateProfileSettings>[0]) {
  return localUpdateProfileSettings(data);
}

export async function updateNotificationSettings(data: Parameters<typeof localUpdateNotificationSettings>[0]) {
  return localUpdateNotificationSettings(data);
}

export async function updatePreferences(data: Parameters<typeof localUpdatePreferences>[0]) {
  return localUpdatePreferences(data);
}

export async function changePasswordAction(data: Parameters<typeof localChangePasswordAction>[0]) {
  return localChangePasswordAction(data);
}

export async function getSessionsAction() {
  return localGetSessionsAction();
}

export async function revokeSessionAction(tokenOrId: string) {
  return localRevokeSessionAction(tokenOrId);
}

export async function revokeOtherSessionsAction() {
  return localRevokeOtherSessionsAction();
}

export async function getUsageMetrics() {
  return localGetUsageMetrics();
}

export async function deleteAccountAction() {
  return localDeleteAccountAction();
}

export async function upgradeEventAction(eventId: string, plan: "premium" | "pro") {
  return localUpgradeEventAction(eventId, plan);
}
