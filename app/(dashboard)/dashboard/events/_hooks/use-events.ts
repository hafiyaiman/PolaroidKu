"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserEvents, createEvent } from "../_actions/event-actions";

export function useEvents(initialEvents?: any[]) {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await getUserEvents();
      return res;
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
