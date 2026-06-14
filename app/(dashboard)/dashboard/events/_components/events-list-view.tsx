"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  CameraIcon,
  PlusIcon,
  ArrowSquareOutIcon,
  GearIcon,
  WarningIcon,
  SpinnerGapIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useEvents } from "../_hooks/use-events";
import { useUpdateEvent, useDeleteEvent } from "../_hooks/use-event-details";

interface EventsListViewProps {
  initialEvents: any[];
}

export function EventsListView({ initialEvents }: EventsListViewProps) {
  const { data: events } = useEvents(initialEvents);

  const eventsList = events || [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 overflow-y-auto">
      {/* Actions header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Digital Guestbooks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your event guestbooks, customize welcome screens, and view guest submissions.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer shadow-md shadow-primary/10 active:scale-95 transition-all">
          <Link href="/dashboard/events/new" className="flex items-center gap-1.5">
            <PlusIcon weight="bold" className="size-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {eventsList.length === 0 ? (
          <Card className="col-span-3 border border-dashed border-border/60 rounded-2xl bg-card/20 py-16 text-center max-w-xl mx-auto w-full flex flex-col items-center p-6 mt-6">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-4 animate-pulse">
              <CameraIcon className="size-8" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">No Guestbooks Created</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Launch your first digital polaroid guestbook to start collecting beautiful guest photos and wishes.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer mt-6 shadow-md shadow-primary/10 active:scale-95 transition-all text-xs">
              <Link href="/dashboard/events/new">
                Create Your First Event
              </Link>
            </Button>
          </Card>
        ) : (
          eventsList.map((event) => (
            <Card
              key={event.id}
              className="flex flex-col bg-card/65 border-border/40 hover:border-primary/20 hover:shadow-lg transition-all relative overflow-hidden group"
            >
              {/* Event Cover Frame / Accent Header */}
              <div className="h-2 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge
                    variant={event.status === "Active" ? "default" : "secondary"}
                    className={
                      event.status === "Active"
                        ? "bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20"
                        : event.status === "Archived"
                        ? "bg-muted text-muted-foreground border border-border"
                        : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                    }
                  >
                    {event.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="size-3.5" />
                    {event.date}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground mt-3 group-hover:text-primary transition-colors">
                  {event.name}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                  &ldquo;{event.welcomeMessage}&rdquo;
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 pb-4 flex flex-col gap-3">
                {/* Sign-in Stats */}
                <div className="flex items-center justify-between text-xs py-3 px-4 rounded-xl bg-muted/30 border border-border/40">
                  <span className="text-muted-foreground">Guest Signatures</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <CameraIcon className="size-4 text-primary font-bold" />
                    {event.guestCount} polaroids
                  </span>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/40 pt-4 flex gap-2">
                <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer active:scale-95 transition-all text-xs py-1 h-9">
                  <Link href={`/dashboard/events/${event.id}`} className="flex items-center justify-center gap-1">
                    <ArrowSquareOutIcon className="size-4" />
                    Open Guestbook
                  </Link>
                </Button>
                
                {/* Manage Settings Gear Button via Inline Dialog component */}
                <ManageEventDialog event={event} />
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

interface ManageEventDialogProps {
  event: any;
}

function ManageEventDialog({ event }: ManageEventDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(event.name);
  const [date, setDate] = React.useState(event.date);
  const [welcomeMessage, setWelcomeMessage] = React.useState(event.welcomeMessage || "");
  const [status, setStatus] = React.useState(event.status);
  const [error, setError] = React.useState("");

  const updateMutation = useUpdateEvent(event.id);
  const deleteMutation = useDeleteEvent();

  // Reset fields when dialog opens
  React.useEffect(() => {
    if (open) {
      setName(event.name);
      setDate(event.date);
      setWelcomeMessage(event.welcomeMessage || "");
      setStatus(event.status);
      setError("");
    }
  }, [open, event]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !date) {
      setError("Event Name and Date are required.");
      return;
    }

    try {
      const res = await updateMutation.mutateAsync({
        name: name.trim(),
        date,
        welcomeMessage: welcomeMessage.trim() || undefined,
        status: status as "Active" | "Archived" | "Draft",
      });

      if (res.error) {
        setError(res.error);
      } else {
        toast.success("Event settings updated successfully!");
        setOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to update event settings.");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "WARNING: This will permanently delete the event and ALL uploaded guest photos/wishes. This action is irreversible. Are you absolutely sure?"
      )
    ) {
      return;
    }

    try {
      const res = await deleteMutation.mutateAsync(event.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Event deleted successfully!");
        setOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete event.");
    }
  };

  // Check if anything has actually changed in the form
  const hasChanges =
    name.trim() !== event.name ||
    date !== event.date ||
    welcomeMessage.trim() !== (event.welcomeMessage || "") ||
    status !== event.status;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border/60 hover:bg-muted cursor-pointer active:scale-95 transition-all p-0 size-9 shrink-0">
          <GearIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border/40">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
            Manage Event Settings
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-4 py-2 text-xs">
          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-1.5">
              <WarningIcon className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor={`manage-name-${event.id}`} className="text-[11px] font-medium text-muted-foreground">
              Event Name
            </Label>
            <Input
              id={`manage-name-${event.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={updateMutation.isPending}
              className="bg-muted/30 border-border/60 focus-visible:ring-primary text-xs h-8"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor={`manage-date-${event.id}`} className="text-[11px] font-medium text-muted-foreground">
              Event Date
            </Label>
            <Input
              id={`manage-date-${event.id}`}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={updateMutation.isPending}
              className="bg-muted/30 border-border/60 focus-visible:ring-primary text-xs h-8"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor={`manage-welcome-${event.id}`} className="text-[11px] font-medium text-muted-foreground">
              Welcoming Message
            </Label>
            <textarea
              id={`manage-welcome-${event.id}`}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={3}
              disabled={updateMutation.isPending}
              className="flex min-h-[60px] w-full rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground">Status</Label>
            <div className="flex gap-2">
              {["Active", "Draft", "Archived"].map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={status === s ? "default" : "outline"}
                  onClick={() => setStatus(s)}
                  disabled={updateMutation.isPending}
                  className="flex-1 text-[10px] h-7 cursor-pointer active:scale-95 transition-all p-0"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border/20 mt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-650 hover:bg-red-700 text-white text-[11px] h-8 px-3 cursor-pointer shrink-0"
            >
              {deleteMutation.isPending ? (
                <SpinnerGapIcon className="size-3.5 animate-spin" />
              ) : (
                <>
                  <TrashIcon className="size-3.5 mr-1 inline" />
                  Delete Event
                </>
              )}
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-[11px] h-8 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || !hasChanges}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11px] h-8 px-3 cursor-pointer"
              >
                {updateMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
