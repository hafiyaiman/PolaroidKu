"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface UsageMetricsData {
  totalEvents: number;
  totalPhotos: number;
  totalStorageBytes: number;
  activeEvents: number;
  expiredEvents: number;
}

interface UsageSettingsProps {
  usage: UsageMetricsData | null;
}

export function UsageSettings({ usage }: UsageSettingsProps) {
  const maxStorageGB = 10;
  const maxPhotos = 10000;
  const storageGB = usage
    ? parseFloat((usage.totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2))
    : 0;

  const storagePct = Math.min(100, Math.round((storageGB / maxStorageGB) * 100));
  const photoPct = usage
    ? Math.min(100, Math.round((usage.totalPhotos / maxPhotos) * 100))
    : 0;

  return (
    <Card className="bg-card/45 border-border/40">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-sm font-bold text-foreground">Usage & Limits</CardTitle>
        <CardDescription className="text-xs">
          Your global SaaS limits aggregated across all created events.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid divide-x grid-cols-2 sm:grid-cols-4">
          <div className="p-4 bg-background/50 border border-border/40 text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Events</p>
            <span className="text-xl font-extrabold text-foreground block mt-1">
              {usage?.totalEvents ?? 0}
            </span>
          </div>
          <div className="p-4 bg-background/50 border border-border/40 text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Events</p>
            <span className="text-xl font-extrabold text-primary block mt-1">
              {usage?.activeEvents ?? 0}
            </span>
          </div>
          <div className="p-4 bg-background/50 border border-border/40 text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expired Events</p>
            <span className="text-xl font-extrabold text-muted-foreground block mt-1">
              {usage?.expiredEvents ?? 0}
            </span>
          </div>
          <div className="p-4 bg-background/50 border border-border/40 text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Photos</p>
            <span className="text-xl font-extrabold text-foreground block mt-1">
              {usage?.totalPhotos ?? 0}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Photo upload usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-foreground">
              <span>Total Photos Uploaded</span>
              <span className="text-muted-foreground font-mono">
                {usage?.totalPhotos ?? 0} / {maxPhotos}
              </span>
            </div>
            <Progress value={photoPct} className="h-2.5 bg-muted" />
            <p className="text-[10px] text-muted-foreground mt-1">
              Total guestbook polaroids snapped across all active galleries.
            </p>
          </div>

          <Separator className="opacity-20" />

          {/* Cloud storage size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-foreground">
              <span>Cloud Storage Used</span>
              <span className="text-muted-foreground font-mono">
                {storageGB} GB / {maxStorageGB} GB
              </span>
            </div>
            <Progress value={storagePct} className="h-2.5 bg-muted" />
            <p className="text-[10px] text-muted-foreground mt-1">
              Aggregated file sizes of private guest photos inside your cloud storage directory.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
