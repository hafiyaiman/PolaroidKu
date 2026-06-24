"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserEvents } from "./_actions/event-actions";
import { EventsListView } from "./_components/events-list-view";
import { Loader2 } from "lucide-react";

export default function Page() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["user-events"],
    queryFn: async () => {
      return await getUserEvents();
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-pink-500" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error || !events) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30 text-red-500 text-xs">
        Failed to load events.
      </div>
    );
  }

  return <EventsListView initialEvents={events} />;
}
