"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventDetails,
  updateEventDetails,
  deleteEventAction,
  deleteSubmissionAction,
  createCustomBorder,
  deleteCustomBorder,
  updateCustomBorder,
} from "../_actions/event-actions";

import { DashboardEventDetails } from "@/types/db";

export interface EventDetailsData {
  success?: boolean;
  event?: DashboardEventDetails;
  submissions?: {
    id: string;
    guestName: string;
    wish: string;
    imageUrl: string;
    time: string;
  }[];
  borders?: {
    id: string;
    name: string | null;
    imageKey: string;
    layoutType: string;
    photoAlign: string;
    imageUrl: string;
  }[];
  error?: string;
}

export function useEventDetails(id: string, initialData?: EventDetailsData) {
  return useQuery<EventDetailsData>({
    queryKey: ["event-details", id],
    queryFn: async () => {
      const res = await getEventDetails(id);
      if (res.error) {
        throw new Error(res.error);
      }
      return res as EventDetailsData;
    },
    initialData: initialData,
    staleTime: 0,
    refetchInterval: 5000,
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name?: string;
      date?: string;
      status?: "draft" | "published" | "expired" | "archived";
      template?: string;
      coverImageKey?: string;
      preheader?: string;
      subheader?: string;
      buttonShape?: string;
      textColor?: string;
      buttonColor?: string;
      buttonTextColor?: string;
      bgColor?: string;
      preheaderColor?: string | null;
      subheaderColor?: string | null;
      showPublicGallery?: boolean;
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

export function useCreateBorder(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      imageKey: string;
      layoutType: string;
      photoAlign?: string;
    }) => createCustomBorder({ eventId, ...data }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["event-details", eventId] });
      }
    },
  });
}

export function useDeleteBorder(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (borderId: string) => deleteCustomBorder(eventId, borderId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["event-details", eventId] });
      }
    },
  });
}

export function useUpdateBorder(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      borderId: string;
      name: string;
      imageKey: string;
      photoAlign?: string;
    }) => updateCustomBorder({ eventId, ...data }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["event-details", eventId] });
      }
    },
  });
}
