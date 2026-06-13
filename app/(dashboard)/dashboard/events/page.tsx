import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  CameraIcon,
  PlusIcon,
  ShieldCheckIcon,
  ArrowSquareOutIcon,
  GearIcon,
  LockKeyIcon
} from "@phosphor-icons/react/dist/ssr";

import { getUserEvents } from "@/app/actions/event-actions";

export default async function Page() {
  const events = await getUserEvents();


  return (
    <>

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
          {events.length === 0 ? (
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
            events.map((event) => (
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
                          : "bg-muted text-muted-foreground"
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
                    "{event.welcomeMessage}"
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
                  <Button variant="outline" asChild className="border-border/60 hover:bg-muted cursor-pointer active:scale-95 transition-all p-0 size-9 shrink-0">
                    <Link href={`/dashboard/events/${event.id}?tab=settings`}>
                      <GearIcon className="size-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
