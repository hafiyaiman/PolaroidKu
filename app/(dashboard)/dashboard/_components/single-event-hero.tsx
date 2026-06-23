"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CameraIcon,
  ChatCircleTextIcon,
  UsersIcon,
  HourglassIcon,
  GearIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";

interface Submission {
  id: string;
  guestName: string;
  wish: string;
  imageUrl: string;
  time: string;
}

interface EventData {
  id: string;
  name: string;
  slug: string;
  date: string;
  status: string;
  plan: string;
  photoLimit: number;
  photoCount: number;
  guestCount: number;
  expiresAt: Date | string | null;
}

interface SingleEventHeroProps {
  event: EventData;
  submissions: Submission[];
}

export function SingleEventHero({ event, submissions }: SingleEventHeroProps) {
  const getDaysRemaining = (expiresAt: Date | string | null) => {
    if (!expiresAt) return null;
    const diffTime = new Date(expiresAt).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining(event.expiresAt);

  // Take first 6 submissions for the photo wall preview
  const previewSubmissions = submissions.slice(0, 6);

  const statusColors: Record<string, string> = {
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    expired: "bg-red-500/10 text-red-500 border-red-500/20",
    archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Event Header Card */}
      <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${statusColors[event.status] || "bg-muted text-muted-foreground"}`}
              >
                {event.status.toUpperCase()}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {event.plan.toUpperCase()} PLAN
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {event.name}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span>Event Date:</span>
              <span className="font-semibold text-foreground">
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              <Link
                href={`/dashboard/events/${event.id}`}
                className="flex items-center gap-1.5"
              >
                <GearIcon weight="bold" className="size-4" />
                Manage Event
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card/45 border border-border/40 hover:border-emerald-500/20 p-5 transition-all flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
            <CameraIcon className="size-6" weight="duotone" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-foreground">
              {event.photoCount}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Photos
            </div>
          </div>
        </div>

        <div className="bg-card/45 border border-border/40 hover:border-blue-500/20 p-5 transition-all flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
            <ChatCircleTextIcon className="size-6" weight="duotone" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-foreground">
              {event.guestCount}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Wishes
            </div>
          </div>
        </div>

        <div className="bg-card/45 border border-border/40 hover:border-indigo-500/20 p-5 transition-all flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-500">
            <UsersIcon className="size-6" weight="duotone" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-foreground">
              {event.guestCount}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Guests
            </div>
          </div>
        </div>

        <div className="bg-card/45 border border-border/40 hover:border-amber-500/20 p-5 transition-all flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
            <HourglassIcon className="size-6" weight="duotone" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-foreground">
              {daysRemaining !== null ? `${daysRemaining} days` : "N/A"}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Remaining
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Memory Wall Preview*/}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-foreground">
            Memory Wall Preview
          </h3>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs text-primary hover:text-primary/80"
          >
            <Link
              href={`/dashboard/events/${event.id}`}
              className="flex items-center gap-1"
            >
              View All
              <ArrowRightIcon className="size-3" />
            </Link>
          </Button>
        </div>

        {previewSubmissions.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground bg-card/25 border border-dashed border-border/40 rounded-xl">
            No photos captured yet. Print your event QR code to get started!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {previewSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="group relative overflow-hidden rounded-lg border border-border/40 bg-muted/30 hover:shadow-md transition-shadow"
              >
                <div className="aspect-square overflow-hidden bg-neutral-900">
                  <img
                    src={sub.imageUrl}
                    alt={sub.guestName}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-1.5 py-1 border-t border-border/30 bg-background/80">
                  <p className="text-[9px] font-semibold truncate">
                    {sub.guestName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
