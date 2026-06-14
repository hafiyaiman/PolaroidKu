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
import { Button } from "@/components/ui/button";
import { useDeleteAccount } from "../_hooks/use-settings";

export function DangerSettings() {
  const { mutateAsync: deleteAccount, isPending } = useDeleteAccount();

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "WARNING: Are you absolutely sure you want to delete your account? This will permanently delete all your events, wishes, and guest photos. This action is irreversible."
    );
    if (!confirmed) return;

    try {
      const res = await deleteAccount();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Account deleted successfully. Redirecting...");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete account.");
    }
  };

  return (
    <Card className="border-red-500/20 bg-red-500/5 shadow-sm shadow-red-500/5">
      <CardHeader className="pb-3 border-red-500/15">
        <CardTitle className="text-sm font-bold text-red-500">Danger Zone</CardTitle>
        <CardDescription className="text-xs text-red-400/80">
          Highly destructive and irreversible actions for your account. Please proceed with extreme caution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-background/40 border border-red-500/10 text-xs">
          <div className="space-y-0.5">
            <p className="font-bold text-foreground">Delete Account</p>
            <span className="text-muted-foreground block">
              Permanently delete your account, events, wishes, and all uploaded guestbook images.
            </span>
          </div>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isPending}
            className="text-xs h-8 shrink-0 cursor-pointer active:scale-95 transition-all bg-red-600 hover:bg-red-600/90 text-white font-bold"
          >
            {isPending ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
