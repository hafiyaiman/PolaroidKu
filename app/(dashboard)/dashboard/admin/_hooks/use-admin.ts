"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllUsersForAdmin, 
  deleteUserAction, 
  updateUserRoleAction, 
  banUserAction, 
  unbanUserAction,
  getAdminOverviewData,
  getAdminBillingData
} from "../_actions/admin-actions";

import { AdminUser } from "../_types";
export type { AdminUser };

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

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await getAdminOverviewData();
      if ("error" in res) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useAdminBilling() {
  return useQuery({
    queryKey: ["admin-billing"],
    queryFn: async () => {
      const res = await getAdminBillingData();
      if ("error" in res) throw new Error(res.error);
      return res.data;
    },
  });
}
