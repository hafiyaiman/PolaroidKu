"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventDetails,
  updateEventDetails,
  deleteEventAction,
  deleteSubmissionAction,
} from "../_actions/event-actions";

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

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name?: string;
      date?: string;
      welcomeMessage?: string;
      status?: "Active" | "Archived" | "Draft";
    }) => updateEventDetails(id, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["event-details", id] });
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEventAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
    },
  });
}

export function useDeleteSubmission(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: string) => deleteSubmissionAction(eventId, submissionId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["event-details", eventId] });
      }
    },
  });
}
