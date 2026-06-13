"use client";

import * as React from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  CalendarIcon,
  CameraIcon,
  DownloadSimpleIcon,
  LockKeyIcon,
  PlayIcon,
  SparkleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  HeartIcon,
  GearIcon,
  SpinnerGapIcon,
  WarningIcon
} from "@phosphor-icons/react";
import { getEventDetails } from "@/app/actions/event-actions";
import { usePageTitle } from "@/components/page-title-context";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  
  const [loading, setLoading] = React.useState(true);
  const [event, setEvent] = React.useState<any>(null);
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [error, setError] = React.useState("");

  const [qrUrl, setQrUrl] = React.useState("");
  const [selectedSub, setSelectedSub] = React.useState<any | null>(null);

  // Push the event name to the shared header breadcrumb
  usePageTitle(event?.name ?? null);

  // Load event and submissions from DB
  React.useEffect(() => {
    setLoading(true);
    getEventDetails(id).then((res) => {
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setEvent(res.event);
        setSubmissions(res.submissions || []);
      }
      setLoading(false);
    });
  }, [id]);

  // Generate QR code locally on the client side
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const publicUploadUrl = `${window.location.origin}/event/${id}/upload`;
      QRCode.toDataURL(publicUploadUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: "#0F172A", // Slate-900
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error("QR Generation Error:", err));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[400px]">
        <SpinnerGapIcon className="size-10 text-pink-500 animate-spin mb-4" />
        <p className="text-xs font-semibold">Opening Guestbook Memories...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[400px] gap-4">
        <div className="size-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 animate-bounce">
          <WarningIcon className="size-8" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Event Not Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">{error || "This event could not be found or you do not have permission to view it."}</p>
        </div>
        <Button variant="outline" size="sm" asChild className="cursor-pointer">
          <Link href="/dashboard/events">
            <ArrowLeftIcon className="size-3.5 mr-1" />
            Back to Events
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 overflow-y-auto">
        {/* Back and Title section */}
        <div className="flex flex-col gap-3">
          <Button variant="ghost" asChild className="self-start text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2">
            <Link href="/dashboard/events" className="flex items-center gap-1">
              <ArrowLeftIcon className="size-3.5" />
              Back to Events
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{event.name}</h1>
                <Badge className="bg-primary/15 text-primary border border-primary/20">
                  {event.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <CalendarIcon className="size-3.5" />
                Scheduled for {event.date}
              </p>
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer shadow-md shadow-primary/10 active:scale-95 transition-all text-xs flex items-center gap-1.5">
              <PlayIcon weight="fill" className="size-3.5" />
              Fullscreen Slideshow
            </Button>
          </div>
        </div>

        {/* Tabbed content */}
        <Tabs defaultValue="guestbook" className="w-full">
          <TabsList className="bg-muted/40 border border-border/40 p-1 mb-6">
            <TabsTrigger value="guestbook" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer text-xs">
              📖 Guestbook Wall
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer text-xs">
              ⚙️ QR & Preferences
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Guestbook Wall */}
          <TabsContent value="guestbook">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border/60 rounded-2xl bg-card/20 text-center max-w-lg mx-auto mt-6">
                <div className="p-4 bg-muted/40 rounded-full text-muted-foreground mb-4">
                  <CameraIcon className="size-8" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Your guestbook is empty</h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
                  Share the QR code in the settings tab with your wedding or event guests so they can start uploading photos and signing the wall!
                </p>
                <TabsList className="bg-transparent mt-4 p-0">
                  <TabsTrigger value="settings" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 font-medium text-xs">
                    Get Event QR Code
                  </TabsTrigger>
                </TabsList>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {submissions.map((sub) => (
                  <Dialog key={sub.id}>
                    <DialogTrigger asChild>
                      <div
                        onClick={() => setSelectedSub(sub)}
                        className="bg-card border border-border/40 hover:border-primary/20 p-4 shadow-md rounded-xl hover:shadow-xl transition-all cursor-pointer flex flex-col items-center group transform hover:-translate-y-0.5"
                      >
                        {/* Polaroid Paper Frame */}
                        <div className="bg-white p-3 pb-8 w-full shadow border border-neutral-100 flex flex-col items-center rounded-sm">
                          {/* Image */}
                          <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 border border-neutral-100">
                            <img
                              src={sub.imageUrl}
                              alt={sub.guestName}
                              className="object-cover w-full h-full filter sepia-[0.05] contrast-[1.02] group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          {/* Polaroid Signature */}
                          <div className="mt-4 text-center font-serif text-neutral-800 text-sm tracking-tight truncate w-full">
                            ✍️ {sub.guestName}
                          </div>
                        </div>

                        {/* Guest Wish Message Box */}
                        <div className="mt-4 w-full text-xs text-foreground/80 italic font-serif bg-muted/30 p-3 rounded-lg border border-border/30 line-clamp-3">
                          "{sub.wish}"
                        </div>
                        <div className="text-[10px] text-muted-foreground self-end mt-2">
                          {sub.time}
                        </div>
                      </div>
                    </DialogTrigger>

                    {/* Polaroid Detail Dialog */}
                    <DialogContent className="sm:max-w-md bg-card border-border/40">
                      <DialogHeader>
                        <DialogTitle className="text-foreground text-base font-semibold">Guestbook Polaroid Page</DialogTitle>
                      </DialogHeader>
                      {selectedSub && (
                        <div className="flex flex-col items-center gap-4 mt-2">
                          <div className="bg-white p-4 pb-12 shadow-2xl rounded border border-neutral-100 w-full max-w-[280px]">
                            <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 border">
                              <img
                                src={selectedSub.imageUrl}
                                alt={selectedSub.guestName}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="mt-5 text-center font-serif text-neutral-800 text-base font-semibold">
                              {selectedSub.guestName}
                            </div>
                          </div>
                          <div className="w-full bg-muted/40 p-4 rounded-xl border border-border/40 italic font-serif text-sm text-foreground/95 text-center">
                            "{selectedSub.wish}"
                          </div>
                          <div className="flex justify-between items-center w-full text-xs text-muted-foreground pt-2 border-t border-border/30">
                            <span>Uploaded {selectedSub.time}</span>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-1" asChild>
                              <a href={selectedSub.imageUrl} download target="_blank" rel="noreferrer">
                                <DownloadSimpleIcon className="size-4" />
                                Download Photo
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Settings & QR */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Event QR Code Card */}
              <Card className="bg-card/65 border-border/40 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-md font-semibold text-foreground flex items-center gap-1.5">
                    <SparkleIcon className="size-5 text-primary" />
                    Guest Sign-in QR Code
                  </CardTitle>
                  <CardDescription>
                    Print or display this code at the venue. Guests can scan, snap, and leave wishes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 py-4">
                  {/* Polaroid Frame for QR Code */}
                  <div className="bg-white p-4 pb-12 shadow-lg rounded border border-neutral-100 flex flex-col items-center w-full max-w-[240px]">
                    <div className="bg-neutral-50 p-2 border border-neutral-200 aspect-square w-full flex items-center justify-center">
                      {qrUrl ? (
                        <img src={qrUrl} alt="Event QR Code" className="w-full h-full" />
                      ) : (
                        <div className="size-44 bg-muted animate-pulse rounded-lg" />
                      )}
                    </div>
                    <div className="mt-4 text-center font-serif text-neutral-800 text-xs font-semibold leading-tight">
                      Scan to Sign Our<br />Polaroid Guestbook
                    </div>
                  </div>

                  {qrUrl && (
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer active:scale-95 transition-all text-xs gap-1.5">
                      <a href={qrUrl} download={`polaroidku-${id}-qr.png`}>
                        <DownloadSimpleIcon className="size-4" />
                        Download QR PNG
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Event Customization Settings */}
              <Card className="bg-card/65 border-border/40 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-md font-semibold text-foreground flex items-center gap-1.5">
                    <GearIcon className="size-5 text-primary" />
                    Guestbook Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure settings for your live venue guestbook uploads.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground font-semibold">Enable Guest Wishes:</span>
                    <Badge className="bg-primary/10 text-primary border border-primary/20">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground font-semibold">Custom Welcome Screen:</span>
                    <Badge className="bg-primary/10 text-primary border border-primary/20">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground font-semibold">Guest Code Protection:</span>
                    <span className="text-muted-foreground">Disabled (Open Public Access)</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground font-semibold">Storage Backup Security:</span>
                    <span className="text-foreground font-semibold flex items-center gap-1.5">
                      <CheckCircleIcon weight="fill" className="size-4 text-green-500" />
                      Auto-Secured
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
