"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  UserIcon,
  WarningIcon,
  CreditCardIcon,
  BellIcon,
  PaletteIcon,
  DatabaseIcon,
  ChartPieIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";

// Import modular settings tab subcomponents
import { AccountSettings } from "./account-settings";
import { SecuritySettings } from "./security-settings";
import { BillingSettings } from "./billing-settings";
import { UsageSettings } from "./usage-settings";
import { NotificationSettings } from "./notification-settings";
import { PreferenceSettings } from "./preference-settings";
import { DeveloperSettings } from "./developer-settings";
import { DangerSettings } from "./danger-settings";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

interface UserSettingsData {
  userId: string;
  phoneNumber: string | null;
  defaultEventVisibility: "public" | "private";
  defaultTheme: "dark" | "light" | "system";
  notifyOnUpload: boolean;
  notifyOnLimit: boolean;
  notifyOnExpiry: boolean;
  notifyOnReceipt: boolean;
}

interface UsageMetricsData {
  totalEvents: number;
  totalPhotos: number;
  totalStorageBytes: number;
  activeEvents: number;
  expiredEvents: number;
}

interface SettingsFormProps {
  user: User;
  initialSettings: UserSettingsData | null;
  initialUsage: UsageMetricsData | null;
  initialSessions: any[];
  initialPurchases: any[];
}

export function SettingsForm({
  user,
  initialSettings,
  initialUsage,
  initialSessions,
  initialPurchases,
}: SettingsFormProps) {
  const [activeTab, setActiveTab] = React.useState<
    "account" | "security" | "billing" | "usage" | "notifications" | "preferences" | "developer" | "danger"
  >("account");

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 overflow-y-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account profile, billing details, usage caps, and custom settings.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Navigation sidebar */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-1.5 shrink-0 overflow-x-auto pb-2 md:pb-0 scrollbar-none border-b md:border-b-0 md:border-r border-border/20 pr-0 md:pr-4">
          <Button
            variant={activeTab === "account" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("account")}
            className="justify-start gap-2.5 text-xs h-9 font-medium px-3 flex-1 md:flex-initial cursor-pointer active:scale-[0.98] shrink-0"
          >
            <UserIcon className="size-4" />
            1. Account
          </Button>
          <Button
            variant={activeTab === "security" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("security")}
            className="justify-start gap-2.5 text-xs h-9 font-medium px-3 flex-1 md:flex-initial cursor-pointer active:scale-[0.98] shrink-0"
          >
            <ShieldCheckIcon className="size-4" />
            2. Security
          </Button>
          <Button
            variant={activeTab === "billing" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("billing")}
            className="justify-start gap-2.5 text-xs h-9 font-medium px-3 flex-1 md:flex-initial cursor-pointer active:scale-[0.98] shrink-0"
          >
            <CreditCardIcon className="size-4" />
            3. Billing & Payments
          </Button>
          <Button
            variant={activeTab === "usage" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("usage")}
            className="justify-start gap-2.5 text-xs h-9 font-medium px-3 flex-1 md:flex-initial cursor-pointer active:scale-[0.98] shrink-0"
          >
            <ChartPieIcon className="size-4" />
            4. Usage & Limits
          </Button>
          <Button
            variant={activeTab === "notifications" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("notifications")}
            className="justify-start gap-2.5 text-xs h-9 font-medium px-3 flex-1 md:flex-initial cursor-pointer active:scale-[0.98] shrink-0"
          >
            <BellIcon className="size-4" />
            5. Notifications
          </Button>
          <Button
            variant={activeTab === "preferences" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("preferences")}
            className="justify-start gap-2.5 text-xs h-9 font-medium px-3 flex-1 md:flex-initial cursor-pointer active:scale-[0.98] shrink-0"
          >
            <PaletteIcon className="size-4" />
            6. Preferences
          </Button>
          <Button
            variant={activeTab === "developer" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("developer")}
            className="justify-start gap-2.5 text-xs h-9 font-medium px-3 flex-1 md:flex-initial cursor-pointer active:scale-[0.98] shrink-0"
          >
            <DatabaseIcon className="size-4" />
            7. Developer Panel
          </Button>
          <Button
            variant={activeTab === "danger" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("danger")}
            className="justify-start gap-2.5 text-xs h-9 font-medium px-3 text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 md:flex-initial cursor-pointer active:scale-[0.98] shrink-0"
          >
            <WarningIcon className="size-4" />
            Danger Zone
          </Button>
        </div>

        {/* Tab content area */}
        <div className="flex-1 w-full space-y-6">
          {activeTab === "account" && (
            <AccountSettings
              user={user}
              phoneNumber={initialSettings?.phoneNumber || ""}
            />
          )}

          {activeTab === "security" && (
            <SecuritySettings initialSessions={initialSessions} />
          )}

          {activeTab === "billing" && (
            <BillingSettings initialPurchases={initialPurchases} />
          )}

          {activeTab === "usage" && (
            <UsageSettings usage={initialUsage} />
          )}

          {activeTab === "notifications" && (
            <NotificationSettings
              email={user.email}
              notifyOnUpload={initialSettings?.notifyOnUpload ?? true}
              notifyOnLimit={initialSettings?.notifyOnLimit ?? true}
              notifyOnExpiry={initialSettings?.notifyOnExpiry ?? true}
              notifyOnReceipt={initialSettings?.notifyOnReceipt ?? true}
            />
          )}

          {activeTab === "preferences" && (
            <PreferenceSettings
              defaultEventVisibility={initialSettings?.defaultEventVisibility ?? "public"}
              defaultTheme={initialSettings?.defaultTheme ?? "dark"}
            />
          )}

          {activeTab === "developer" && (
            <DeveloperSettings userId={user.id} role={user.role} />
          )}

          {activeTab === "danger" && <DangerSettings />}
        </div>
      </div>
    </div>
  );
}
