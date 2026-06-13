"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon } from "@phosphor-icons/react";

interface DeveloperSettingsProps {
  userId: string;
  role: string;
}

export function DeveloperSettings({ userId, role }: DeveloperSettingsProps) {
  return (
    <Card className="bg-card/45 border-border/40">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-sm font-bold text-foreground">Storage Credentials & Configuration</CardTitle>
        <CardDescription className="text-xs">
          Your events store guest photos directly in Cloudflare R2 object storage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 text-xs">
        <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Active Bucket Prefix:</span>
            <span className="text-foreground font-mono font-bold bg-muted/40 px-2 py-0.5 rounded text-[11px]">
              {`users/${userId}/`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Authentication Tier:</span>
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px]">
              {role === "admin" ? "Super Admin" : "Standard User"}
            </Badge>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-green-500/5 border border-green-500/10 flex justify-between items-center">
          <span className="text-muted-foreground font-semibold">R2 Storage Gateway Connection:</span>
          <Badge className="bg-green-500/15 text-green-500 border border-green-500/20 flex items-center gap-1.5 font-semibold">
            <CheckCircleIcon weight="fill" className="size-4" />
            Online & Linked
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
