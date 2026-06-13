"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEvent } from "@/app/actions/event-actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  SpinnerGapIcon,
  WarningIcon
} from "@phosphor-icons/react";

export default function Page() {
  const router = useRouter();
  const [eventName, setEventName] = React.useState("");
  const [eventDate, setEventDate] = React.useState("");
  const [welcomeMessage, setWelcomeMessage] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !eventDate) {
      setError("Please fill out all required fields.");
      return;
    }

    setIsPending(true);
    setError("");

    try {
      const res = await createEvent({
        name: eventName.trim(),
        date: eventDate,
        welcomeMessage: welcomeMessage.trim() || undefined,
      });

      if (res.error) {
        setError(res.error);
        setIsPending(false);
      } else if (res.eventId) {
        router.push(`/dashboard/events/${res.eventId}`);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to create event. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 items-center justify-start overflow-y-auto">
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {/* Back button */}
          <Button variant="ghost" asChild className="self-start text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2">
            <Link href="/dashboard/events" className="flex items-center gap-1">
              <ArrowLeftIcon className="size-3.5" />
              Back to Events
            </Link>
          </Button>

          <Card className="bg-card/65 border-border/40 hover:shadow-lg transition-all overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />
            
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Launch New Guestbook</CardTitle>
                <CardDescription>
                  Configure details for your guests and automatically secure uploads.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-1.5">
                    <WarningIcon className="size-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form Input fields */}
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-name" className="text-sm font-medium text-foreground">
                      Event Name <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="event-name"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="e.g. Sarah & David's Wedding"
                      required
                      disabled={isPending}
                      className="bg-muted/30 border-border/60 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="event-date" className="text-sm font-medium text-foreground">
                      Event Date <span className="text-primary">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="event-date"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                        disabled={isPending}
                        className="bg-muted/30 border-border/60 focus-visible:ring-primary pl-10"
                      />
                      <CalendarIcon className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="welcome-msg" className="text-sm font-medium text-foreground">
                      Welcoming Message
                    </Label>
                    <textarea
                      id="welcome-msg"
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      rows={3}
                      disabled={isPending}
                      placeholder="Write a message to welcome your guests when they scan the QR code..."
                      className="flex min-h-[80px] w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/40 pt-4 flex justify-between items-center gap-4">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldCheckIcon className="size-4 text-primary" />
                  No setup fee. Setup in 10 seconds.
                </span>
                <div className="flex gap-2.5">
                  <Button variant="ghost" asChild disabled={isPending} className="cursor-pointer">
                    <Link href="/dashboard/events">Cancel</Link>
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer shadow-md shadow-primary/15 active:scale-95 transition-all text-xs gap-1.5"
                  >
                    {isPending ? (
                      <>
                        <SpinnerGapIcon className="size-4 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      "Launch Guestbook"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}

