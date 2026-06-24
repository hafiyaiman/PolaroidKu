"use client";

import * as React from "react";
import {
  requestGuestUploadUrl,
  submitGuestSubmission,
} from "@/app/actions/guest-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircleIcon, HeartIcon, DownloadSimpleIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { GuestLandingTemplate } from "@/components/guest-landing-template";
import { EditorShell } from "./editor/editor-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type PublicEventDetails = {
  id: string;
  name: string;
  date: string;
  status: string;
  slug: string;
  template: string | null;
  coverImageKey: string | null;
  preheader: string | null;
  subheader: string | null;
  buttonShape: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  bgColor: string | null;
  preheaderColor: string | null;
  subheaderColor: string | null;
  coverImageUrl?: string;
  showPublicGallery?: boolean | null;
};

interface BorderItem {
  id: string;
  name: string | null;
  imageKey: string;
  layoutType: string;
  photoAlign?: string;
  imageUrl: string;
}

interface Submission {
  id: string;
  guestName: string;
  wish: string;
  imageUrl: string;
  time: string;
}

interface UploadFormProps {
  id: string;
  initialEvent: PublicEventDetails;
  initialBorders: BorderItem[];
  initialSubmissions: Submission[];
}

export function UploadForm({
  id,
  initialEvent,
  initialBorders = [],
  initialSubmissions = [],
}: UploadFormProps) {
  const [eventData] = React.useState<PublicEventDetails>(initialEvent);
  const [submissions, setSubmissions] =
    React.useState<Submission[]>(initialSubmissions);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [successData, setSuccessData] = React.useState<{
    name: string;
    wish: string;
    imageUrl: string;
    file?: Blob;
  } | null>(null);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const customButtonBg = eventData.buttonColor || undefined;
  const customButtonText = eventData.buttonTextColor || undefined;

  const handleEditorSubmit = async (editorData: {
    file: Blob;
    guestName: string;
    message: string;
  }) => {
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const fileName = `composite-${Date.now()}.jpg`;
      const presignedRes = await requestGuestUploadUrl({
        eventId: id,
        filename: fileName,
        contentType: "image/jpeg",
      });

      if (presignedRes.error) {
        toast.error(presignedRes.error);
        return;
      }

      const { uploadUrl, key } = presignedRes;
      setUploadProgress(40);

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl!, true);
      xhr.setRequestHeader("Content-Type", "image/jpeg");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(40 + Math.round((e.loaded / e.total) * 40));
        }
      };

      const uploadOk = await new Promise<boolean>((res) => {
        xhr.onload = () => res(xhr.status === 200);
        xhr.onerror = () => res(false);
        xhr.send(editorData.file);
      });

      if (!uploadOk) {
        toast.error("Upload failed. Please try again.");
        return;
      }

      setUploadProgress(90);

      const submitRes = await submitGuestSubmission({
        eventId: id,
        guestName: editorData.guestName,
        message: editorData.message,
        imageKey: key!,
        imageSize: editorData.file.size,
        mimeType: "image/jpeg",
      });

      if (submitRes.error) {
        toast.error(submitRes.error);
        return;
      }

      setUploadProgress(100);

      const previewUrl = URL.createObjectURL(editorData.file);
      setSuccessData({
        name: editorData.guestName,
        wish: editorData.message,
        imageUrl: previewUrl,
        file: editorData.file,
      });
      setSubmissions((prev) => [
        {
          id: submitRes.submissionId || crypto.randomUUID(),
          guestName: editorData.guestName,
          wish: editorData.message,
          imageUrl: previewUrl,
          time: "Just now",
        },
        ...prev,
      ]);

      toast.success("Polaroid posted to the memory wall!");
      setSubmitSuccess(true);
      setIsUploadOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = () => {
    if (!successData) return;
    const link = document.createElement("a");
    link.href = successData.imageUrl;
    link.download = `polaroid-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  const handleShare = async () => {
    if (!successData || !successData.file) return;
    const file = new File([successData.file], "polaroid.jpg", { type: "image/jpeg" });

    if (navigator.share) {
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My Polaroid Memory",
            text: "Captured at " + eventData.name,
          });
          toast.success("Shared successfully!");
          return;
        }
      } catch (err) {
        console.warn("Web Share API aborted or failed:", err);
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied! Download the image to share it on Instagram Story.");
      handleDownload();
    } catch {
      toast.info("Downloading image to share!");
      handleDownload();
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitSuccess && successData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="relative mb-6">
          <div className="size-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary">
            <CheckCircleIcon weight="fill" className="size-10" />
          </div>
          <span className="text-xl absolute -top-1 -right-1">✨</span>
          <HeartIcon
            weight="fill"
            className="size-5 text-primary absolute -bottom-1 -left-1 animate-pulse"
          />
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Memory Captured!</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Your polaroid and warm wishes have been pinned to the live wall. 💖
        </p>

        <div className="mt-8 bg-white shadow-2xl rounded w-full max-w-[220px] rotate-2 transition-transform hover:rotate-0 duration-300">
          <div className="w-full overflow-hidden">
            <img
              src={successData.imageUrl}
              alt="Your polaroid"
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Share & Download actions */}
        <div className="flex gap-3 w-full max-w-[220px] mt-8">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-1.5 font-semibold text-xs h-10 border-border/80 hover:bg-muted active:scale-95 transition-all cursor-pointer"
          >
            <DownloadSimpleIcon className="size-4" />
            Download
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 font-semibold text-xs h-10 bg-gradient-to-tr from-purple-600 via-pink-600 to-yellow-500 hover:opacity-90 active:scale-95 text-white border-none transition-all cursor-pointer shadow-md"
          >
            <ShareNetworkIcon className="size-4" />
            Share
          </Button>
        </div>

        <div className="w-full max-w-[220px] mt-3">
          <Button
            onClick={() => {
              setSubmitSuccess(false);
              setSuccessData(null);
            }}
            className={cn(
              "w-full font-semibold cursor-pointer active:scale-95 transition-all text-xs h-9 text-muted-foreground hover:text-foreground",
            )}
            variant="ghost"
          >
            Back to Welcome
          </Button>
        </div>
      </div>
    );
  }

  // ── Editor element ──────────────────────────────────────────────────────────
  const renderEditor = () => (
    <EditorShell
      eventId={id}
      borders={initialBorders}
      customButtonBg={customButtonBg}
      customButtonText={customButtonText}
      eventName={eventData.name}
      eventDate={eventData.date}
      onSubmit={handleEditorSubmit}
      onClose={() => setIsUploadOpen(false)}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
    />
  );

  return (
    <div
      className="w-full min-h-screen flex flex-col overflow-y-auto bg-background scroll-smooth"
      style={{ backgroundColor: eventData.bgColor || undefined }}
    >
      {/* Landing hero */}
      <div className="w-full h-screen shrink-0">
        <GuestLandingTemplate
          template={eventData.template || "classic"}
          preheader={eventData.preheader || "Our Guestbook"}
          eventName={eventData.name}
          subheader={eventData.subheader || eventData.date}
          coverImageUrl={eventData.coverImageUrl}
          buttonShape={eventData.buttonShape || "rounded"}
          textColor={eventData.textColor}
          buttonColor={eventData.buttonColor}
          buttonTextColor={eventData.buttonTextColor}
          bgColor={eventData.bgColor}
          preheaderColor={eventData.preheaderColor}
          subheaderColor={eventData.subheaderColor}
          onAction={() => setIsUploadOpen(true)}
          isPreview={false}
        />
      </div>

      {/* Memory Wall grid — visible only when admin allows */}
      {eventData.showPublicGallery && submissions.length > 0 && (
        <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16 shrink-0 border-t border-border/20">
          <div className="text-center mb-8 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider">
              <HeartIcon weight="fill" className="size-3" />
              Memory Wall
            </div>
            <h2
              className="text-xl md:text-2xl font-bold tracking-tight font-serif"
              style={{ color: eventData.textColor || undefined }}
            >
              Memories &amp; Wishes
            </h2>
            <p className="text-[11px] text-muted-foreground max-w-sm">
              Heartfelt snaps from our sweet guests.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="group relative overflow-hidden shadow-md bg-neutral-900"
              >
                <div className="overflow-hidden">
                  <img
                    src={sub.imageUrl}
                    alt={sub.guestName}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-2 py-2 border-t border-border/30 bg-background/80 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold truncate text-foreground">
                    {sub.guestName}
                  </p>
                  {sub.wish && (
                    <p className="text-[9px] text-muted-foreground truncate mt-0.5">
                      {sub.wish}
                    </p>
                  )}
                  <p className="text-[8px] text-muted-foreground/60 mt-0.5">
                    {sub.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile: true full-screen overlay (like Instagram camera) */}
      {isMobile ? (
        isUploadOpen ? (
          <div
            className="fixed inset-0 z-50 bg-black flex flex-col"
            style={{ height: "100dvh" }}
          >
            {renderEditor()}
          </div>
        ) : null
      ) : (
        /* Desktop: centered dialog */
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-[420px] bg-zinc-950 border-zinc-900 p-0 overflow-hidden flex flex-col max-h-[95dvh] dark text-zinc-100"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>Sign the Polaroid Guestbook</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden min-h-0">
              {renderEditor()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
