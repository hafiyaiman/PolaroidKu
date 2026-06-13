"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllUsersForAdmin } from "../_actions/admin-actions";

export function useAdminUsers(initialUsers?: any[]) {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await getAllUsersForAdmin();
      if ("error" in res) throw new Error(res.error);
      return res.users || [];
    },
    initialData: initialUsers,
  });
}
