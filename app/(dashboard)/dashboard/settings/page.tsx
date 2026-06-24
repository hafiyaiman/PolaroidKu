"use client";

import { authClient } from "@/lib/auth/client";
import { SettingsForm } from "./_components/settings-form";
import {
  getSettings,
  getUsageMetrics,
  getSessionsAction,
  getSettingsBillingPurchasesAction,
} from "./_actions/settings-actions";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import * as React from "react";

export default function Page() {
  const { data: sessionState } = authClient.useSession();

  const { data: res, isLoading, error } = useQuery({
    queryKey: ["settings-data"],
    queryFn: async () => {
      const [settingsRes, usageRes, sessionsRes, purchasesRes] = await Promise.all([
        getSettings(),
        getUsageMetrics(),
        getSessionsAction(),
        getSettingsBillingPurchasesAction(),
      ]);
      return { settingsRes, usageRes, sessionsRes, purchasesRes };
    },
  });

  if (isLoading || !sessionState?.user) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-pink-500" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error || !res) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30 text-red-500 text-xs">
        Failed to load settings.
      </div>
    );
  }

  const { settingsRes, usageRes, sessionsRes, purchasesRes } = res;

  const settings = settingsRes.success && "settings" in settingsRes && settingsRes.settings
    ? {
        ...settingsRes.settings,
        theme: settingsRes.settings.theme as "dark" | "light" | "system",
      }
    : null;

  const usage = usageRes.success && "metrics" in usageRes ? usageRes.metrics : null;
  const activeSessions = sessionsRes.success && "sessions" in sessionsRes ? sessionsRes.sessions : [];
  const purchases = purchasesRes.success && "purchases" in purchasesRes ? purchasesRes.purchases || [] : [];

  const user = {
    id: sessionState.user.id,
    name: sessionState.user.name || "",
    email: sessionState.user.email,
    role: (sessionState.user as any).role || "user",
    image: sessionState.user.image || "",
  };

  return (
    <SettingsForm
      user={user}
      initialSettings={settings}
      initialUsage={usage}
      initialSessions={activeSessions}
      initialPurchases={purchases}
    />
  );
}
