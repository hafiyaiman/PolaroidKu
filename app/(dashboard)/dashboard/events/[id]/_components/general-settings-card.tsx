"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GearIcon, SpinnerGapIcon, WarningIcon } from "@phosphor-icons/react";

interface GeneralSettingsCardProps {
  initialName: string;
  initialDate: string;
  initialStatus: string;
  savePending: boolean;
  deletePending: boolean;
  onSave: (data: { name: string; date: string; status: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function GeneralSettingsCard({
  initialName,
  initialDate,
  initialStatus,
  savePending,
  deletePending,
  onSave,
  onDelete,
}: GeneralSettingsCardProps) {
  const [name, setName] = React.useState(initialName);
  const [date, setDate] = React.useState(initialDate);
  const [status, setStatus] = React.useState(initialStatus);
  const [saveError, setSaveError] = React.useState("");

  const hasChanges =
    name.trim() !== initialName ||
    date !== initialDate ||
    status !== initialStatus;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");

    if (!name.trim() || !date) {
      setSaveError("Event Name and Date are required.");
      return;
    }

    try {
      await onSave({ name: name.trim(), date, status });
    } catch {
      setSaveError("Failed to update event settings.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/65 border-border/40 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <GearIcon className="size-4 text-primary" />
              Configure Preferences
            </CardTitle>
            <CardDescription className="text-xs">
              Update event visual settings, scheduling date, and status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {saveError && (
              <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-1.5">
                <WarningIcon className="size-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="edit-name" className="text-xs font-semibold text-foreground">
                Event / Header Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={savePending}
                className="bg-muted/30 border-border/60 focus-visible:ring-primary text-xs"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-date" className="text-xs font-semibold text-foreground">
                Event Date
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={savePending}
                className="bg-muted/30 border-border/60 focus-visible:ring-primary text-xs"
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-foreground">Status</Label>
              <div className="flex gap-2">
                {["published", "draft", "archived"].map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={status === s ? "default" : "outline"}
                    onClick={() => setStatus(s)}
                    disabled={savePending}
                    className="flex-1 text-xs h-8 cursor-pointer active:scale-95 transition-all p-0 capitalize"
                  >
                    {s === "published" ? "Active" : s}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-4 flex justify-end">
            <Button
              type="submit"
              disabled={savePending || !hasChanges}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer shadow-sm active:scale-95 transition-all text-xs h-8 px-6"
            >
              {savePending ? (
                <>
                  <SpinnerGapIcon className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20 bg-red-500/5 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold text-red-500 flex items-center gap-1.5 uppercase tracking-wider">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-xs text-muted-foreground leading-normal mb-3">
            Permanently delete this event and remove all uploaded guest photos. This action is irreversible.
          </p>
          <Button
            type="button"
            variant="destructive"
            disabled={deletePending}
            onClick={onDelete}
            className="bg-red-650 hover:bg-red-700 text-white font-semibold cursor-pointer text-xs h-8 px-6"
          >
            {deletePending ? (
              <SpinnerGapIcon className="size-3.5 animate-spin" />
            ) : (
              "Delete Event"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
