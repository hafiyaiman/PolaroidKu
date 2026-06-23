"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  PlayIcon,
  ArrowLeftIcon,
  QrCodeIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePageTitle } from "@/components/page-title-context";
import {
  useEventDetails,
  useUpdateEvent,
  useDeleteEvent,
  useDeleteSubmission,
} from "../../_hooks/use-event-details";
import {
  EventDesignerForm,
  type EventDesignerFormValues,
} from "@/components/event-designer-form";
import { DashboardEventDetails } from "@/types/db";
import { SubmissionsGrid } from "./submissions-grid";
import { QrSidebar } from "./qr-sidebar";
import { GeneralSettingsCard } from "./general-settings-card";
import { CustomBordersTab } from "./custom-borders-tab";

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
  initialBorders: {
    id: string;
    name: string | null;
    imageKey: string;
    layoutType: string;
    photoAlign: string;
    imageUrl: string;
  }[];
}

export function EventDetailsView({
  id,
  initialEvent,
  initialSubmissions,
  initialBorders,
}: EventDetailsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data } = useEventDetails(id, {
    success: true,
    event: initialEvent,
    submissions: initialSubmissions,
    borders: initialBorders,
  });

  const event = data?.event || initialEvent;
  const submissions = data?.submissions || initialSubmissions;

  const [qrUrl, setQrUrl] = React.useState("");

  const queryTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = React.useState(queryTab || "guestbook");

  React.useEffect(() => {
    if (queryTab && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", val);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const [builderOpen, setBuilderOpen] = React.useState(false);
  const [isSavingDesign, setIsSavingDesign] = React.useState(false);

  // Mutations
  const updateEvent = useUpdateEvent(id);
  const deleteEvent = useDeleteEvent();
  const deleteSubmission = useDeleteSubmission(id);

  // Push the event name to the shared header breadcrumb
  usePageTitle(event?.name ?? null);

  // Guest upload page public URL
  const publicUploadUrl =
    typeof window !== "undefined"
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

  const handleSaveSettings = async (settingsData: {
    name: string;
    date: string;
    status: string;
    showPublicGallery: boolean;
  }) => {
    try {
      const res = await updateEvent.mutateAsync({
        name: settingsData.name,
        date: settingsData.date,
        status: settingsData.status as
          | "draft"
          | "published"
          | "expired"
          | "archived",
        showPublicGallery: settingsData.showPublicGallery,
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
        preheaderColor: values.preheaderColor,
        subheaderColor: values.subheaderColor,
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
        "WARNING: This will permanently delete the event and ALL uploaded guest photos/wishes. This action is irreversible. Are you absolutely sure?",
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
    <div
      className={`flex flex-1 flex-col gap-4 bg-background/30 min-h-0 overflow-hidden ${
        activeTab === "designer" ? "p-0 lg:p-6" : "p-4 md:p-6"
      }`}
    >
      {/* Back and Title section */}
      <div
        className={`flex flex-col gap-3 shrink-0 ${activeTab === "designer" ? "hidden lg:flex" : ""}`}
      >
        <Button
          variant="ghost"
          asChild
          className="self-start text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2"
        >
          <Link href="/dashboard/events" className="flex items-center gap-1">
            <ArrowLeftIcon className="size-3.5" />
            Back to Events
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {event.name}
              </h1>
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

          {activeTab === "guestbook" && (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer shadow-md shadow-primary/10 active:scale-95 transition-all text-xs flex items-center gap-1.5 w-full sm:w-auto justify-center">
              <PlayIcon weight="fill" className="size-3.5" />
              Fullscreen Slideshow
            </Button>
          )}

          {activeTab === "borders" && (
            <Button
              onClick={() => setBuilderOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer shadow-md shadow-primary/10 active:scale-95 transition-all text-xs flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              <PlusIcon weight="bold" className="size-3.5" />
              Create New Frame
            </Button>
          )}
        </div>
      </div>

      {/* Main Tab Container */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full flex-1 flex flex-col overflow-hidden"
      >
        <TabsList
          className={`bg-muted/40 border border-border/40 p-1 mb-4 shrink-0 self-start ${activeTab === "designer" ? "hidden lg:flex" : ""}`}
        >
          <TabsTrigger
            value="guestbook"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer text-xs"
          >
            📖 Guestbook Wall
          </TabsTrigger>
          <TabsTrigger
            value="designer"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer text-xs"
          >
            🎨 Visual Designer
          </TabsTrigger>
          <TabsTrigger
            value="borders"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer text-xs"
          >
            🖼️ Frames
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer text-xs"
          >
            ⚙️ Settings
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Guestbook Wall & QR side-by-side (Scrolling container) */}
        <TabsContent
          value="guestbook"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-0 flex-1 overflow-y-auto pr-1 relative"
        >
          <SubmissionsGrid
            submissions={submissions}
            deletePending={deleteSubmission.isPending}
            onDelete={handleDeleteSubmission}
          />

          {/* Desktop QrSidebar (hidden on mobile, managed by className inside component) */}
          <QrSidebar
            id={id}
            qrUrl={qrUrl}
            photoCount={event.photoCount}
            photoLimit={event.photoLimit}
            publicUploadUrl={publicUploadUrl}
            onCopyLink={handleCopyLink}
          />

          {/* Mobile FAB Dialog Trigger for QR Code */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="fixed bottom-6 right-6 lg:hidden size-12 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground z-50 flex items-center justify-center cursor-pointer border border-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <QrCodeIcon className="size-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border/40">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-foreground text-sm font-semibold uppercase tracking-wider">
                  Event QR Code & Info
                </DialogTitle>
              </DialogHeader>
              <div className="py-2">
                <QrSidebar
                  id={id}
                  qrUrl={qrUrl}
                  photoCount={event.photoCount}
                  photoLimit={event.photoLimit}
                  publicUploadUrl={publicUploadUrl}
                  onCopyLink={handleCopyLink}
                  isMobileDialog
                />
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB 2: Visual Customizer */}
        <TabsContent
          value="designer"
          className="mt-0 flex-1 min-h-0 overflow-hidden flex flex-col pb-6"
        >
          <EventDesignerForm
            eventId={id}
            initialValues={{
              ...event,
              template: event.template || "classic",
              coverImageKey: event.coverImageKey || undefined,
              coverImageUrl: event.coverImageUrl || undefined,
              preheader: event.preheader || undefined,
              subheader: event.subheader || undefined,
              preheaderColor: event.preheaderColor || undefined,
              subheaderColor: event.subheaderColor || undefined,
              buttonShape: event.buttonShape || undefined,
              textColor: event.textColor || undefined,
              buttonColor: event.buttonColor || undefined,
              buttonTextColor: event.buttonTextColor || undefined,
              bgColor: event.bgColor || undefined,
            }}
            isNewEvent={false}
            isPending={isSavingDesign}
            onSubmit={handleSaveDesign}
            submitButtonText="Save Changes"
            onCancel={() => handleTabChange("guestbook")}
          />
        </TabsContent>

        {/* TAB 3: Event Settings & Preferences (Scrolling container) */}
        <TabsContent
          value="settings"
          className="space-y-6 mt-0 flex-1 overflow-y-auto pr-1"
        >
          <GeneralSettingsCard
            key={id}
            initialName={event.name}
            initialDate={event.date}
            initialStatus={event.status}
            initialShowPublicGallery={event.showPublicGallery ?? true}
            savePending={updateEvent.isPending}
            deletePending={deleteEvent.isPending}
            onSave={handleSaveSettings}
            onDelete={handleDeleteEvent}
          />
        </TabsContent>

        {/* TAB 4: Custom Borders */}
        <TabsContent
          value="borders"
          className="mt-0 flex-1 overflow-y-auto pr-1 pb-6"
        >
          <CustomBordersTab
            eventId={id}
            borders={data?.borders || []}
            builderOpen={builderOpen}
            onBuilderOpenChange={setBuilderOpen}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
