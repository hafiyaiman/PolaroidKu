"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getEventDetails } from "../_actions/event-actions";
import { EventDetailsView } from "./_components/event-details-view";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Page({ params }: { params: React.Usable<{ id: string }> }) {
  const { id } = React.use(params);
  
  const { data: res, isLoading, error } = useQuery({
    queryKey: ["event-details", id],
    queryFn: async () => {
      return await getEventDetails(id);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-pink-500" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !res || res.error || !res.event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[400px] gap-4">
        <div className="size-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 animate-bounce">
          <span className="text-xl">⚠️</span>
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Event Not Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {res?.error || "This event could not be found or you do not have permission to view it."}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="cursor-pointer">
          <Link href="/dashboard/events">
            Back to Events
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <EventDetailsView
      id={id}
      initialEvent={res.event}
      initialSubmissions={res.submissions || []}
      initialBorders={res.borders || []}
    />
  );
}
