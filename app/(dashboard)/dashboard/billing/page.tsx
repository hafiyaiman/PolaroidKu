"use client";

import { useQuery } from "@tanstack/react-query";
import { getBillingDataAction } from "./_actions/billing-actions";
import { BillingDashboard } from "./_components/billing-dashboard";
import { Loader2 } from "lucide-react";

export default function Page() {
  const { data: res, isLoading, error } = useQuery({
    queryKey: ["billing-data"],
    queryFn: async () => {
      const result = await getBillingDataAction();
      if ("error" in result) throw new Error(result.error);
      return result;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-pink-500" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Loading billing details...</p>
        </div>
      </div>
    );
  }

  if (error || !res || !res.events) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30 text-red-500 text-xs">
        Failed to load billing dashboard.
      </div>
    );
  }

  return (
    <BillingDashboard
      initialEvents={res.events}
      initialPurchases={res.purchases || []}
    />
  );
}
