"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProfileSettings,
  changePasswordAction,
  updatePreferences,
  updateNotificationSettings,
  revokeSessionAction,
  revokeOtherSessionsAction,
  deleteAccountAction,
  getSessionsAction,
} from "../_actions/settings-actions";

export interface SessionRecord {
  id: string;
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: string | Date;
  active?: boolean;
}

export function useSessions(initialSessions?: SessionRecord[]) {
  return useQuery<SessionRecord[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await getSessionsAction();
      if ("error" in res) throw new Error(res.error);
      return (res.sessions as SessionRecord[]) || [];
    },
    initialData: initialSessions,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileSettings,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePasswordAction,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      }
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      }
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeSessionAction,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
      }
    },
  });
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeOtherSessionsAction,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
      }
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccountAction,
  });
}
