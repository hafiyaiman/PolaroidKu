"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserEvents, createEvent } from "../_actions/event-actions";

import { DashboardEvent } from "@/types/db";

export function useEvents(initialEvents?: DashboardEvent[]) {
  return useQuery<DashboardEvent[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await getUserEvents();
      return res as DashboardEvent[];
    },
    initialData: initialEvents,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
    },
  });
}
