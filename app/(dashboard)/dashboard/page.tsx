"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import {
  getDashboardStats,
  getRecentSubmissions,
  getUserEvents,
  getEventDetails,
} from "@/app/actions/event-actions";
import { StatsCards } from "./_components/stats-cards";
import { EventCard } from "./_components/event-card";
import { ActivityTimeline } from "./_components/activity-timeline";
import { EmptyState } from "./_components/empty-state";
import { SingleEventHero } from "./_components/single-event-hero";

export default function Page() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const [stats, events, recent] = await Promise.all([
        getDashboardStats(),
        getUserEvents(),
        getRecentSubmissions(),
      ]);

      let singleEventDetails: {
        id: string;
        name: string;
        slug: string;
        date: string;
        status: string;
        plan: string;
        photoLimit: number;
        photoCount: number;
        expiresAt: Date | string | null;
      } | null = null;
      let singleEventSubmissions: {
        id: string;
        guestName: string;
        wish: string;
        imageUrl: string;
        time: string;
      }[] = [];

      if (events.length === 1) {
        const detailsResult = await getEventDetails(events[0].id);
        if (detailsResult.success) {
          singleEventDetails = detailsResult.event;
          singleEventSubmissions = detailsResult.submissions || [];
        }
      }

      return {
        stats,
        events,
        recent,
        singleEventDetails,
        singleEventSubmissions,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-pink-500" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30 text-red-500 text-xs">
        Failed to load dashboard.
      </div>
    );
  }

  const {
    stats: dbStats,
    events: userEvents,
    recent: recentSubmissions,
    singleEventDetails,
    singleEventSubmissions,
  } = dashboardData;

  // If user has zero events, show a premium empty welcome state
  if (userEvents.length === 0) {
    return (
      <div className="flex flex-1 flex-col justify-center p-4 md:p-6 bg-background/30 overflow-y-auto">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 overflow-y-auto">
      {/* Welcome Section */}
      {userEvents.length > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/15 rounded-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome Back!
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Design for the future, optimize for today. Here is how your events
              are doing.
            </p>
          </div>
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <Link
              href="/dashboard/events/new"
              className="flex items-center gap-1.5"
            >
              <PlusIcon weight="bold" className="size-4" />
              New Event
            </Link>
          </Button>
        </div>
      )}

      {/* Top Stats - only rendered when user has multiple events */}
      {userEvents.length > 1 && <StatsCards stats={dbStats} />}

      {/* Main Section */}
      {userEvents.length === 1 && singleEventDetails ? (
        /* Case B: Single Event Hero Layout */
        <SingleEventHero
          event={{
            ...singleEventDetails,
            guestCount: userEvents[0].guestCount,
          }}
          submissions={singleEventSubmissions}
        />
      ) : (
        /* Case C: Multiple Events Portfolio Layout */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Events List Grid (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Your Events
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {userEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>

          {/* Recent Activity Timeline (Right 1 column) */}
          <div className="space-y-4">
            <ActivityTimeline activities={recentSubmissions} />
          </div>
        </div>
      )}
    </div>
  );
}
