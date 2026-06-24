"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CameraIcon,
  ChatCircleTextIcon,
  UsersIcon,
  HourglassIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";

export interface EventCardData {
  id: string;
  name: string;
  slug: string;
  date: string;
  status: "draft" | "published" | "expired" | "archived" | string;
  plan: "free" | "premium" | "pro" | string;
  photoLimit: number;
  photoCount: number;
  guestCount: number; // calculated submission count
  expiresAt: Date | string | null;
}

interface EventCardProps {
  event: EventCardData;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const getDaysRemaining = (expiresAt: Date | string | null) => {
    if (!expiresAt) return null;
    const diffTime = new Date(expiresAt).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining(event.expiresAt);

  const statusColors: Record<string, string> = {
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    expired: "bg-red-500/10 text-red-500 border-red-500/20",
    archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  const planColors: Record<string, string> = {
    free: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    premium: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    pro: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  };

  return (
    <Card className="flex flex-col bg-card/45 border-border/40 hover:border-primary/25 hover:shadow-lg transition-all group overflow-hidden h-full" onClick={() => router.push(`/dashboard/events/${event.id}`)}>
      <CardHeader className="flex flex-col gap-2 pb-4">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className={`${statusColors[event.status] || "bg-muted text-muted-foreground"}`}>
            {event.status.toUpperCase()}
          </Badge>
          <Badge variant="outline" className={`${planColors[event.plan] || "bg-muted text-muted-foreground"}`}>
            {event.plan.toUpperCase()}
          </Badge>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {event.name}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between gap-6 pt-0 pb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/10">
            <CameraIcon className="size-4 text-emerald-500" />
            <span className="font-semibold text-foreground">{event.photoCount}</span>
            <span className="text-xs text-muted-foreground">Photos</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/10">
            <ChatCircleTextIcon className="size-4 text-blue-500" />
            <span className="font-semibold text-foreground">{event.guestCount}</span>
            <span className="text-xs text-muted-foreground">Wishes</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/10">
            <UsersIcon className="size-4 text-indigo-500" />
            <span className="font-semibold text-foreground">{event.guestCount}</span>
            <span className="text-xs text-muted-foreground">Guests</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/10">
            <HourglassIcon className="size-4 text-amber-500" />
            <span className="font-semibold text-foreground">
              {daysRemaining !== null ? `${daysRemaining}d` : "N/A"}
            </span>
            <span className="text-xs text-muted-foreground">Remaining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
