"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  CameraIcon,
  DownloadSimpleIcon,
  PlayIcon,
  SparkleIcon,
  ArrowLeftIcon,
  GearIcon,
  TrashIcon,
  SpinnerGapIcon,
  WarningIcon,
  CopyIcon,
} from "@phosphor-icons/react";
import { usePageTitle } from "@/components/page-title-context";
import {
  useEventDetails,
  useUpdateEvent,
  useDeleteEvent,
  useDeleteSubmission,
} from "../../_hooks/use-event-details";
import type { Submission } from "../../_types";

interface EventDetailsViewProps {
  id: string;
  initialEvent: any;
  initialSubmissions: any[];
}

export function EventDetailsView({ id, initialEvent, initialSubmissions }: EventDetailsViewProps) {
  const router = useRouter();
  
  const { data } = useEventDetails(id, {
    success: true,
    event: initialEvent,
    submissions: initialSubmissions,
  });

  const event = data?.event || initialEvent;
  const submissions = data?.submissions || initialSubmissions;

  const [qrUrl, setQrUrl] = React.useState("");
  const [selectedSub, setSelectedSub] = React.useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Edit form states
  const [editName, setEditName] = React.useState(event?.name || "");
  const [editDate, setEditDate] = React.useState(event?.date || "");
  const [editWelcomeMessage, setEditWelcomeMessage] = React.useState(event?.welcomeMessage || "");
  const [editStatus, setEditStatus] = React.useState(event?.status || "Active");
  const [saveError, setSaveError] = React.useState("");

  // Mutations
  const updateEvent = useUpdateEvent(id);
  const deleteEvent = useDeleteEvent();
  const deleteSubmission = useDeleteSubmission(id);

  // Sync state with incoming event data
  React.useEffect(() => {
    if (event) {
      setEditName(event.name || "");
      setEditDate(event.date || "");
      setEditWelcomeMessage(event.welcomeMessage || "");
      setEditStatus(event.status || "Active");
    }
  }, [event]);

  // Push the event name to the shared header breadcrumb
  usePageTitle(event?.name ?? null);

  // Guest upload page public URL
  const publicUploadUrl = typeof window !== "undefined"
    ? `${window.location.origin}/event/${id}/upload`
    : "";

  // Generate QR code locally on the client side
  React.useEffect(() => {
    if (publicUploadUrl) {
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
  }, [publicUploadUrl]);

  const handleCopyLink = () => {
    if (publicUploadUrl) {
      navigator.clipboard.writeText(publicUploadUrl);
      toast.success("Guest Sign-in link copied to clipboard!");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");

    if (!editName.trim() || !editDate) {
      setSaveError("Event Name and Date are required.");
      return;
    }

    try {
      const res = await updateEvent.mutateAsync({
        name: editName.trim(),
        date: editDate,
        welcomeMessage: editWelcomeMessage.trim() || undefined,
        status: editStatus as "Active" | "Archived" | "Draft",
      });

      if (res.error) {
        setSaveError(res.error);
      } else {
        toast.success("Event settings saved successfully!");
      }
    } catch (err: any) {
      console.error(err);
      setSaveError("Failed to update event settings.");
    }
  };

  const handleDeleteEvent = async () => {
    if (
      !confirm(
        "WARNING: This will permanently delete the event and ALL uploaded guest photos/wishes. This action is irreversible. Are you absolutely sure?"
      )
    ) {
      return;
    }

    try {
      const res = await deleteEvent.mutateAsync(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Event deleted successfully!");
        router.push("/dashboard/events");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete event.");
    }
  };

  const handleDeleteSubmission = async (subId: string) => {
    if (!confirm("Are you sure you want to delete this guest polaroid? This cannot be undone.")) {
      return;
    }

    try {
      const res = await deleteSubmission.mutateAsync(subId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Guest polaroid deleted.");
        setDialogOpen(false);
        setSelectedSub(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete submission.");
    }
  };

  // Determine if settings form has unsaved modifications
  const hasChanges =
    editName.trim() !== (event?.name || "") ||
    editDate !== (event?.date || "") ||
    editWelcomeMessage.trim() !== (event?.welcomeMessage || "") ||
    editStatus !== (event?.status || "Active");

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 overflow-y-auto">
      {/* Back and Title section */}
      <div className="flex flex-col gap-3">
        <Button variant="ghost" asChild className="self-start text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2">
          <Link href="/dashboard/events" className="flex items-center gap-1">
            <ArrowLeftIcon className="size-3.5" />
            Back to Events
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{event.name}</h1>
              <Badge
                className={
                  event.status === "Active"
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : event.status === "Archived"
                    ? "bg-muted text-muted-foreground border border-border"
                    : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                }
              >
                {event.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CalendarIcon className="size-3.5" />
              Scheduled for {event.date}
            </p>
          </div>

          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer shadow-md shadow-primary/10 active:scale-95 transition-all text-xs flex items-center gap-1.5 w-full sm:w-auto justify-center">
            <PlayIcon weight="fill" className="size-3.5" />
            Fullscreen Slideshow
          </Button>
        </div>
      </div>

      {/* Main Tab Container */}
      <Tabs defaultValue="guestbook" className="w-full">
        <TabsList className="bg-muted/40 border border-border/40 p-1 mb-6">
          <TabsTrigger value="guestbook" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer text-xs">
            📖 Guestbook Wall
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer text-xs">
            ⚙️ Settings
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Guestbook Wall & QR side-by-side */}
        <TabsContent value="guestbook" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-0">
          
          {/* Left side: Polaroid Feed (2/3 width) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/20">
              <div>
                <h2 className="text-md font-bold text-foreground">Guestbook Wall</h2>
                <p className="text-[11px] text-muted-foreground">
                  All guest submissions in real-time. Click any polaroid to view or delete.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-border">
                {submissions.length} polaroids
              </Badge>
            </div>

            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border/60 rounded-2xl bg-card/10 text-center">
                <div className="p-4 bg-muted/30 rounded-full text-muted-foreground mb-4">
                  <CameraIcon className="size-8" />
                </div>
                <h3 className="font-semibold text-base text-foreground">Your guestbook is empty</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Provide the QR code to your event guests so they can start snapping photos and signing the wall!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {submissions.map((sub: Submission) => (
                  <Dialog key={sub.id} open={dialogOpen && selectedSub?.id === sub.id} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (open) setSelectedSub(sub);
                  }}>
                    <DialogTrigger asChild>
                      <div
                        onClick={() => {
                          setSelectedSub(sub);
                          setDialogOpen(true);
                        }}
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
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                disabled={deleteSubmission.isPending}
                                onClick={() => handleDeleteSubmission(selectedSub.id)}
                                className="text-red-500 hover:text-red-650 hover:bg-red-500/10 gap-1 text-xs cursor-pointer"
                              >
                                {deleteSubmission.isPending ? (
                                  <SpinnerGapIcon className="size-3.5 animate-spin" />
                                ) : (
                                  <TrashIcon className="size-3.5" />
                                )}
                                Delete
                              </Button>
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-1" asChild>
                                <a href={selectedSub.imageUrl} download target="_blank" rel="noreferrer">
                                  <DownloadSimpleIcon className="size-4" />
                                  Download Photo
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </div>

          {/* Right side: QR & Copy Link sidebar (1/3 width) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            <Card className="bg-card/65 border-border/40 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <SparkleIcon className="size-4 text-primary" />
                  Live Sign-In QR
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Present this QR code at your venue for guests to scan and sign.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 py-2">
                {/* Polaroid Frame for QR Code */}
                <div className="bg-white p-3 pb-8 shadow-md rounded border border-neutral-100 flex flex-col items-center w-full max-w-[200px] transition-transform hover:scale-[1.01]">
                  <div className="bg-neutral-50 p-2 border border-neutral-200 aspect-square w-full flex items-center justify-center">
                    {qrUrl ? (
                      <img src={qrUrl} alt="Event QR Code" className="w-full h-full" />
                    ) : (
                      <div className="size-36 bg-muted animate-pulse rounded-lg" />
                    )}
                  </div>
                  <div className="mt-3.5 text-center font-serif text-neutral-800 text-[10px] font-semibold leading-tight">
                    Scan to Sign Our<br />Polaroid Guestbook
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-2 pb-4">
                <Button onClick={handleCopyLink} variant="outline" className="flex-1 text-[11px] gap-1 cursor-pointer h-8">
                  <CopyIcon className="size-3.5" />
                  Copy Link
                </Button>
                {qrUrl && (
                  <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer active:scale-95 transition-all text-[11px] h-8 gap-1">
                    <a href={qrUrl} download={`polaroidku-${id}-qr.png`}>
                      <DownloadSimpleIcon className="size-3.5" />
                      Save PNG
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Quick Status Info */}
            <Card className="bg-card/65 border-border/40 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Guestbook Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground font-medium">Welcome Message</span>
                  <span className="text-[10px] bg-muted/65 px-2 py-0.5 rounded text-foreground italic max-w-[150px] truncate">
                    &ldquo;{event.welcomeMessage}&rdquo;
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground font-medium">Sign-in Limits</span>
                  <span className="font-semibold text-foreground">
                    {event.photoCount} / {event.photoLimit} photos
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: Event Settings & Preferences */}
        <TabsContent value="settings" className=" space-y-6 mt-0">
          <Card className="bg-card/65 border-border/40 overflow-hidden">
            <form onSubmit={handleSaveSettings}>
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
                    Event Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={updateEvent.isPending}
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
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    disabled={updateEvent.isPending}
                    className="bg-muted/30 border-border/60 focus-visible:ring-primary text-xs"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="edit-welcome" className="text-xs font-semibold text-foreground">
                    Welcoming Message
                  </Label>
                  <textarea
                    id="edit-welcome"
                    value={editWelcomeMessage}
                    onChange={(e) => setEditWelcomeMessage(e.target.value)}
                    rows={4}
                    disabled={updateEvent.isPending}
                    className="flex min-h-[90px] w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-foreground">Status</Label>
                  <div className="flex gap-2">
                    {["Active", "Draft", "Archived"].map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant={editStatus === status ? "default" : "outline"}
                        onClick={() => setEditStatus(status)}
                        disabled={updateEvent.isPending}
                        className="flex-1 text-xs h-8 cursor-pointer active:scale-95 transition-all p-0"
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={updateEvent.isPending || !hasChanges}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer shadow-sm active:scale-95 transition-all text-xs h-8 px-6"
                >
                  {updateEvent.isPending ? (
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
                disabled={deleteEvent.isPending}
                onClick={handleDeleteEvent}
                className="bg-red-650 hover:bg-red-700 text-white font-semibold cursor-pointer text-xs h-8 px-6"
              >
                {deleteEvent.isPending ? (
                  <SpinnerGapIcon className="size-3.5 animate-spin" />
                ) : (
                  "Delete Event"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
