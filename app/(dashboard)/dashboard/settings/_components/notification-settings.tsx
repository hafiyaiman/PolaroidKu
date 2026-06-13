"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUpdateNotificationSettings } from "../_hooks/use-settings";

interface NotificationSettingsProps {
  email: string;
  notifyOnUpload: boolean;
  notifyOnLimit: boolean;
  notifyOnExpiry: boolean;
  notifyOnReceipt: boolean;
}

export function NotificationSettings({
  email,
  notifyOnUpload: initialUpload,
  notifyOnLimit: initialLimit,
  notifyOnExpiry: initialExpiry,
  notifyOnReceipt: initialReceipt,
}: NotificationSettingsProps) {
  const [notifyOnUpload, setNotifyOnUpload] = React.useState(initialUpload);
  const [notifyOnLimit, setNotifyOnLimit] = React.useState(initialLimit);
  const [notifyOnExpiry, setNotifyOnExpiry] = React.useState(initialExpiry);
  const [notifyOnReceipt, setNotifyOnReceipt] = React.useState(initialReceipt);

  const { mutateAsync: updateNotifications, isPending } = useUpdateNotificationSettings();

  const handleToggleNotification = (field: "upload" | "limit" | "expiry" | "receipt", value: boolean) => {
    const payload: any = {};
    if (field === "upload") {
      setNotifyOnUpload(value);
      payload.notifyOnUpload = value;
    }
    if (field === "limit") {
      setNotifyOnLimit(value);
      payload.notifyOnLimit = value;
    }
    if (field === "expiry") {
      setNotifyOnExpiry(value);
      payload.notifyOnExpiry = value;
    }
    if (field === "receipt") {
      setNotifyOnReceipt(value);
      payload.notifyOnReceipt = value;
    }

    updateNotifications(payload).then((res) => {
      if (res.error) {
        toast.error(res.error);
        // revert local state
        if (field === "upload") setNotifyOnUpload(!value);
        if (field === "limit") setNotifyOnLimit(!value);
        if (field === "expiry") setNotifyOnExpiry(!value);
        if (field === "receipt") setNotifyOnReceipt(!value);
      } else {
        toast.success("Notification settings synced.");
      }
    }).catch((err) => {
      console.error(err);
      toast.error("An error occurred while updating notifications.");
      // revert local state
      if (field === "upload") setNotifyOnUpload(!value);
      if (field === "limit") setNotifyOnLimit(!value);
      if (field === "expiry") setNotifyOnExpiry(!value);
      if (field === "receipt") setNotifyOnReceipt(!value);
    });
  };

  return (
    <Card className="bg-card/45 border-border/40">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-sm font-bold text-foreground">Email Notifications</CardTitle>
        <CardDescription className="text-xs">
          Toggle alerts and transaction warnings sent to {email}.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 divide-y divide-border/25">
        {/* Notify on upload */}
        <div className="flex justify-between items-center py-4 first:pt-0">
          <div className="space-y-0.5 max-w-[80%]">
            <p className="text-xs font-bold text-foreground">Guest Photo Upload Alerts</p>
            <span className="text-[10px] text-muted-foreground block">
              Receive an email notification every time a guest uploads a new photo/wish to your active event walls.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifyOnUpload}
            onClick={() => handleToggleNotification("upload", !notifyOnUpload)}
            disabled={isPending}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              notifyOnUpload ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                notifyOnUpload ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Notify on limit */}
        <div className="flex justify-between items-center py-4">
          <div className="space-y-0.5 max-w-[80%]">
            <p className="text-xs font-bold text-foreground">Event Cap Warning Alerts</p>
            <span className="text-[10px] text-muted-foreground block">
              Receive an alert when an active event reaches 80% of its total photo upload limits.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifyOnLimit}
            onClick={() => handleToggleNotification("limit", !notifyOnLimit)}
            disabled={isPending}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              notifyOnLimit ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                notifyOnLimit ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Notify on expiry */}
        <div className="flex justify-between items-center py-4">
          <div className="space-y-0.5 max-w-[80%]">
            <p className="text-xs font-bold text-foreground">Event Expiration Alerts</p>
            <span className="text-[10px] text-muted-foreground block">
              Receive an email 7 days and 24 hours before your event guestbooks expire and files are deleted.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifyOnExpiry}
            onClick={() => handleToggleNotification("expiry", !notifyOnExpiry)}
            disabled={isPending}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              notifyOnExpiry ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                notifyOnExpiry ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Notify on receipt */}
        <div className="flex justify-between items-center py-4 last:pb-0">
          <div className="space-y-0.5 max-w-[80%]">
            <p className="text-xs font-bold text-foreground">Billing Invoice & Payment Receipts</p>
            <span className="text-[10px] text-muted-foreground block">
              Send a receipts PDF to my inbox after every successful event upgrade transaction.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifyOnReceipt}
            onClick={() => handleToggleNotification("receipt", !notifyOnReceipt)}
            disabled={isPending}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              notifyOnReceipt ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                notifyOnReceipt ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
