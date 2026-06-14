"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllUsersForAdmin } from "../_actions/admin-actions";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
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
