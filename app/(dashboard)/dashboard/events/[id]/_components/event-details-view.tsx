"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  PlayIcon,
  ArrowLeftIcon
} from "@phosphor-icons/react";
import { usePageTitle } from "@/components/page-title-context";
import {
  useEventDetails,
  useUpdateEvent,
  useDeleteEvent,
  useDeleteSubmission,
} from "../../_hooks/use-event-details";
import { EventDesignerForm, type EventDesignerFormValues } from "@/components/event-designer-form";
import { DashboardEventDetails } from "@/types/db";
import { SubmissionsGrid } from "./submissions-grid";
import { QrSidebar } from "./qr-sidebar";
import { GeneralSettingsCard } from "./general-settings-card";

export interface EventSubmission {
  id: string;
  guestName: string;
  wish: string;
  imageUrl: string;
  time: string;
}

interface EventDetailsViewProps {
  id: string;
  initialEvent: DashboardEventDetails;
  initialSubmissions: EventSubmission[];
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
  const [activeTab, setActiveTab] = React.useState("guestbook");
  const [isSavingDesign, setIsSavingDesign] = React.useState(false);

  // Mutations
  const updateEvent = useUpdateEvent(id);
  const deleteEvent = useDeleteEvent();
  const deleteSubmission = useDeleteSubmission(id);

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

  const handleSaveSettings = async (settingsData: { name: string; date: string; status: string }) => {
    try {
      const res = await updateEvent.mutateAsync({
        name: settingsData.name,
        date: settingsData.date,
        status: settingsData.status as "draft" | "published" | "expired" | "archived",
      });

      if (res.error) {
        toast.error(res.error);
        throw new Error(res.error);
      } else {
        toast.success("Event settings saved successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update event settings.");
      throw err;
    }
  };

  const handleSaveDesign = async (values: EventDesignerFormValues) => {
    setIsSavingDesign(true);

    try {
      const res = await updateEvent.mutateAsync({
        name: values.name,
        template: values.template,
        coverImageKey: values.coverImageKey ?? undefined,
        preheader: values.preheader || "Our Guestbook",
        subheader: values.subheader ?? undefined,
        buttonShape: values.buttonShape,
        textColor: values.textColor,
        buttonColor: values.buttonColor,
        buttonTextColor: values.buttonTextColor,
        bgColor: values.bgColor,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Visual customizer settings applied!");
      }
    } catch (err) {
      const error = err as Error;
      console.error(error);
      toast.error("Failed to apply design changes.");
    } finally {
      setIsSavingDesign(false);
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
    } catch (err) {
      const error = err as Error;
      console.error(error);
      toast.error("Failed to delete event.");
    }
  };

  const handleDeleteSubmission = async (subId: string) => {
    try {
      const res = await deleteSubmission.mutateAsync(subId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Guest polaroid deleted.");
      }
    } catch (err) {
      const error = err as Error;
      console.error(error);
      toast.error("Failed to delete submission.");
    }
  };

  return (
    <div className={`flex flex-1 flex-col gap-4 bg-background/30 min-h-0 overflow-hidden ${
      activeTab === "designer" ? "p-0 lg:p-6" : "p-4 md:p-6"
    }`}>
      {/* Back and Title section */}
      <div className={`flex flex-col gap-3 shrink-0 ${activeTab === "designer" ? "hidden lg:flex" : ""}`}>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
        <TabsList className={`bg-muted/40 border border-border/40 p-1 mb-4 shrink-0 self-start ${activeTab === "designer" ? "hidden lg:flex" : ""}`}>
          <TabsTrigger value="guestbook" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer text-xs">
            📖 Guestbook Wall
          </TabsTrigger>
          <TabsTrigger value="designer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer text-xs">
            🎨 Visual Designer
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer text-xs">
            ⚙️ Settings
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Guestbook Wall & QR side-by-side (Scrolling container) */}
        <TabsContent value="guestbook" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-0 flex-1 overflow-y-auto pr-1">
          <SubmissionsGrid
            submissions={submissions}
            deletePending={deleteSubmission.isPending}
            onDelete={handleDeleteSubmission}
          />
          <QrSidebar
            id={id}
            qrUrl={qrUrl}
            photoCount={event.photoCount}
            photoLimit={event.photoLimit}
            publicUploadUrl={publicUploadUrl}
            onCopyLink={handleCopyLink}
          />
        </TabsContent>

        {/* TAB 2: Visual Customizer */}
        <TabsContent value="designer" className="mt-0 flex-1 min-h-0 overflow-hidden flex flex-col pb-6">
          <EventDesignerForm
            eventId={id}
            initialValues={event}
            isNewEvent={false}
            isPending={isSavingDesign}
            onSubmit={handleSaveDesign}
            submitButtonText="Save Changes"
            onCancel={() => setActiveTab("guestbook")}
          />
        </TabsContent>

        {/* TAB 3: Event Settings & Preferences (Scrolling container) */}
        <TabsContent value="settings" className="space-y-6 mt-0 flex-1 overflow-y-auto pr-1">
          <GeneralSettingsCard
            key={id}
            initialName={event.name}
            initialDate={event.date}
            initialStatus={event.status}
            savePending={updateEvent.isPending}
            deletePending={deleteEvent.isPending}
            onSave={handleSaveSettings}
            onDelete={handleDeleteEvent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
