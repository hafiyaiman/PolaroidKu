"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upgradeEventAction } from "../_actions/billing-actions";

export function useUpgradeEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, plan }: { eventId: string; plan: "premium" | "pro" }) => {
      return upgradeEventAction(eventId, plan);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["events"] });
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      }
    },
  });
}
