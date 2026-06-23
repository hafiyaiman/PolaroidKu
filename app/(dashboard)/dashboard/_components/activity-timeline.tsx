import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CameraIcon, ChatCircleTextIcon, ClockIcon } from "@phosphor-icons/react/dist/ssr";

export interface ActivityItem {
  id: string;
  eventId: string;
  eventName: string;
  guestName: string | null;
  wish: string | null;
  imageUrl: string;
  time: string;
  type: "wish" | "photo";
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card className="bg-card/45 border-border/40 hover:shadow-md transition-all h-full">
      <CardHeader className="pb-3 border-b border-border/10">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
          <ClockIcon className="size-5 text-primary" weight="duotone" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 px-6">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/40 rounded-xl">
            No submissions captured yet.
          </div>
        ) : (
          <div className="relative border-l border-border/60 pl-6 space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-[37px] top-0.5 p-1.5 rounded-full border border-border/60 bg-background group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                  {activity.type === "wish" ? (
                    <ChatCircleTextIcon className="size-3.5 text-blue-500" weight="fill" />
                  ) : (
                    <CameraIcon className="size-3.5 text-emerald-500" weight="fill" />
                  )}
                </div>

                {/* Timeline item body */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-x-1.5 text-sm text-foreground">
                    <span className="font-bold text-foreground">
                      {activity.guestName || "Someone"}
                    </span>
                    <span className="text-muted-foreground">
                      {activity.type === "wish" ? "left a wish" : "uploaded a photo"}
                    </span>
                    <span className="text-muted-foreground">on</span>
                    <Link
                      href={`/dashboard/events/${activity.eventId}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {activity.eventName}
                    </Link>
                  </div>

                  {activity.wish && (
                    <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded border border-border/10 line-clamp-2">
                      &quot;{activity.wish}&quot;
                    </p>
                  )}

                  <span className="text-[10px] font-medium text-muted-foreground/80 flex items-center gap-1">
                    <ClockIcon className="size-3" />
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
