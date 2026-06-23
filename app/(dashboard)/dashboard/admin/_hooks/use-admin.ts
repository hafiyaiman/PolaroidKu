"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsersForAdmin, deleteUserAction, updateUserRoleAction, banUserAction, unbanUserAction } from "../_actions/admin-actions";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  eventsCount: number;
  bucketSize: string;
  r2ConsoleUrl: string;
}

export function useAdminUsers(initialUsers?: AdminUser[]) {
  return useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await getAllUsersForAdmin();
      if ("error" in res) throw new Error(res.error);
      return res.users || [];
    },
    initialData: initialUsers,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await deleteUserAction(userId);
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "user" | "admin" }) => {
      const res = await updateUserRoleAction(userId, role);
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const res = await banUserAction(userId, reason);
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await unbanUserAction(userId);
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
