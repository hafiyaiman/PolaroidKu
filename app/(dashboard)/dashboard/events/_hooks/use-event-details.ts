"use client";

import { useQuery } from "@tanstack/react-query";
import { getEventDetails } from "../_actions/event-actions";

export function useEventDetails(id: string, initialData?: any) {
  return useQuery({
    queryKey: ["event-details", id],
    queryFn: async () => {
      const res = await getEventDetails(id);
      if (res.error) {
        throw new Error(res.error);
      }
      return res;
    },
    initialData: initialData,
  });
}
