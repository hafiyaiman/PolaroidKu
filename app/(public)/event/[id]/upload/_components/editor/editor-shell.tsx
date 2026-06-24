"use client";

import * as React from "react";
import { toast } from "sonner";
import { BorderItem, SYSTEM_BORDERS } from "./frame-picker";
import { SlotCanvas, PhotoSlotState, DEFAULT_SLOT } from "./slot-canvas";
import { cn } from "@/lib/utils";
import {
  XIcon,
  PaperPlaneRightIcon,
  SpinnerGapIcon,
  CameraRotateIcon,
  ImageIcon,
} from "@phosphor-icons/react";
import {
  PinkFloralFramePreview,
  BlueFloralFramePreview,
  getDateCaption,
} from "@/components/frames/floral-frames";
import {
  REF_W,
  REF_H,
  REF_SLOT,
  getDisplaySlotY,
  clampOffset,
  buildComposite,
} from "./composite-renderer";

// ── Types ─────────────────────────────────────────────────────────────────────
interface EditorShellProps {
  eventId: string;
  borders: BorderItem[];
  customButtonBg?: string;
  customButtonText?: string;
  eventName?: string;
  eventDate?: string;
  onSubmit: (data: {
    file: Blob;
    guestName: string;
    message: string;
  }) => Promise<void>;
  onClose: () => void;
  isUploading: boolean;
  uploadProgress: number;
}

// ── Step enum ─────────────────────────────────────────────────────────────────
type Step = "compose" | "details";

// ── Main component ────────────────────────────────────────────────────────────
export function EditorShell({
  borders,
  customButtonBg,
  customButtonText,
  eventName,
  eventDate,
  onSubmit,
  onClose,
  isUploading,
  uploadProgress,
}: EditorShellProps) {
  const allBorders = React.useMemo(
    () => [...SYSTEM_BORDERS, ...borders],
    [borders],
  );
  const [selectedBorder, setSelectedBorder] = React.useState<BorderItem>(
    allBorders[0],
  );
  const [photoCount, setPhotoCount] = React.useState(1);
  const [slots, setSlots] = React.useState<PhotoSlotState[]>([
    { ...DEFAULT_SLOT },
  ]);
  const [activeSlot, setActiveSlot] = React.useState(0);
  const [step, setStep] = React.useState<Step>("compose");
  const [guestName, setGuestName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pendingSlotRef = React.useRef(0);

  const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = React.useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  // Start/stop camera stream
  React.useEffect(() => {
    let active = true;
    let localStream: MediaStream | null = null;

    async function startCamera() {
      if (step !== "compose") return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        localStream = stream;
        setCameraStream(stream);
        setCameraError(null);
      } catch (err) {
        console.error("Camera access error:", err);
        if (active) {
          setCameraError("Camera access denied or unavailable.");
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      setCameraStream(null);
    };
  }, [step, facingMode]);

  // Measure actual canvas container size for responsive scaling
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = React.useState({ w: REF_W, h: REF_H });

  React.useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          // Maintain 9:16 aspect ratio, fit within container
          const containerAspect = width / height;
          const targetAspect = 9 / 16;
          let canvasW: number;
          let canvasH: number;
          if (containerAspect > targetAspect) {
            // Container is wider — height-constrained
            canvasH = Math.min(height, REF_H);
            canvasW = canvasH * targetAspect;
          } else {
            // Container is taller — width-constrained
            canvasW = Math.min(width, REF_W);
            canvasH = canvasW / targetAspect;
          }
          setCanvasSize({ w: Math.round(canvasW), h: Math.round(canvasH) });
        }
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Scale factor from reference (360×640) to actual canvas
  const scaleX = canvasSize.w / REF_W;
  const scaleY = canvasSize.h / REF_H;

  // Scaled slot dimensions
  const slotX = REF_SLOT.x * scaleX;
  const slotW = REF_SLOT.w * scaleX;
  const slotH = REF_SLOT.h * scaleY;
  const slotGap = 6 * scaleY;

  const layoutType = selectedBorder.layoutType ?? "story_916";
  const slotCount = photoCount;

  // Sync slots on layout count change while preserving existing photos
  React.useEffect(() => {
    setSlots((prev) => {
      const next = Array.from({ length: photoCount }, (_, idx) => {
        return prev[idx] || { ...DEFAULT_SLOT };
      });
      return next;
    });
    setActiveSlot(0);
  }, [photoCount]);

  // Auto-change photoCount based on the selected border template
  React.useEffect(() => {
    if (
      selectedBorder.id === "sys_pink_floral" ||
      selectedBorder.id === "sys_blue_floral"
    ) {
      setPhotoCount(3);
    } else if (selectedBorder.id === "sys_polaroid") {
      setPhotoCount(1);
    }
  }, [selectedBorder.id]);

  const handleSlotClick = (idx: number) => {
    pendingSlotRef.current = idx;
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Select an image.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setSlots((prev) => {
        const next = [...prev];
        next[pendingSlotRef.current] = {
          file,
          previewUrl: url,
          zoom: 1,
          offset: { x: 0, y: 0 },
          aspectRatio: img.naturalWidth / img.naturalHeight,
        };
        return next;
      });
      setActiveSlot(pendingSlotRef.current);
    };
    img.src = url;
    e.target.value = "";
  };

  const handleRemoveSlot = (idx: number) => {
    setSlots((prev) => {
      const next = [...prev];
      if (prev[idx]?.previewUrl) URL.revokeObjectURL(prev[idx].previewUrl);
      next[idx] = { ...DEFAULT_SLOT };
      return next;
    });
  };

  const capturePhoto = () => {
    if (!cameraStream) {
      toast.error("Camera not active.");
      return;
    }
    const video = document.querySelector(`[data-slot-idx="${activeSlot}"] video`) as HTMLVideoElement | null;
    if (!video) {
      toast.error("Camera feed not ready.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${activeSlot}-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const url = URL.createObjectURL(file);
      
      setSlots((prev) => {
        const next = [...prev];
        next[activeSlot] = {
          file,
          previewUrl: url,
          zoom: 1,
          offset: { x: 0, y: 0 },
          aspectRatio: canvas.width / canvas.height,
        };
        return next;
      });

      // Find next empty slot
      const tempSlots = [...slots];
      tempSlots[activeSlot] = { file } as any;
      const nextEmpty = tempSlots.findIndex((s, idx) => idx < photoCount && !s.file);
      if (nextEmpty !== -1) {
        setActiveSlot(nextEmpty);
      }
      
      toast.success(`Photo ${activeSlot + 1} captured!`);
    }, "image/jpeg", 0.95);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleGalleryImportClick = () => {
    pendingSlotRef.current = activeSlot;
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error("Enter your name.");
      return;
    }
    try {
      const blob = await buildComposite(
        slots,
        layoutType,
        selectedBorder.imageUrl,
        selectedBorder.id === "sys_polaroid",
        photoCount,
        selectedBorder.photoAlign || "center",
        eventName || "",
        eventDate || "",
      );
      await onSubmit({ file: blob, guestName, message });
    } catch (err) {
      console.error(err);
      toast.error("Failed to process photo.");
    }
  };

  const hasAllFilled = slots.slice(0, slotCount).every((s) => s.file !== null);
  const emptyCount = slots.slice(0, slotCount).filter((s) => !s.file).length;

  return (
    <div className="flex flex-col w-full h-full bg-black text-white overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {step === "compose" ? (
        <>
          {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 pt-safe-top pt-3 pb-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="size-9 flex items-center justify-center rounded-full bg-zinc-900/80 text-white active:scale-90 transition-all"
            >
              <XIcon className="size-5" weight="bold" />
            </button>
            <span className="text-xs font-semibold text-zinc-300 tracking-widest uppercase truncate max-w-[140px]">
              {selectedBorder.name}
            </span>
            {hasAllFilled ? (
              <button
                type="button"
                onClick={() => setStep("details")}
                className="px-4 h-8 text-xs font-bold bg-white text-black rounded-full active:scale-95 transition-all"
              >
                Next →
              </button>
            ) : (
              <div className="w-16" />
            )}
          </div>

          {/* ── PHOTO VIEWPORT ──────────────────────────────────────────────── */}
          <div
            ref={viewportRef}
            className="flex-1 flex items-center justify-center min-h-0 relative"
          >
            {/* Layout selector — compact row ABOVE canvas on very small screens */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-row gap-2 z-30 sm:hidden">
              {[1, 2, 3].map((count) => {
                const isActive = photoCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setPhotoCount(count)}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all select-none border cursor-pointer text-[10px] font-bold",
                      isActive
                        ? "bg-white text-black border-white shadow-lg"
                        : "bg-black/60 text-white/70 border-white/20",
                    )}
                  >
                    {count}×
                  </button>
                );
              })}
            </div>

            {/* Layout selector — vertical on left for larger screens */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-2.5 z-30">
              {[1, 2, 3].map((count) => {
                const isActive = photoCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setPhotoCount(count)}
                    className={cn(
                      "flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all select-none border cursor-pointer",
                      isActive
                        ? "bg-white text-black border-white font-bold scale-110 shadow-lg"
                        : "bg-black/50 text-white/70 border-white/20 hover:bg-black/70",
                    )}
                  >
                    <span className="text-[11px] font-bold tracking-tight">
                      {count}×
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Composition area — dynamically sized */}
            <div
              className="relative overflow-hidden shadow-2xl bg-white border border-zinc-900 shrink-0 select-none"
              style={{
                width: canvasSize.w,
                height: canvasSize.h,
                position: "relative",
              }}
            >
              {/* Photo slots container — scaled proportionally */}
              {/* Custom frames: photos at z-10, frame PNG (with transparent hole) at z-20 on top.
                  System frames: photos at z-20, above the background gradient overlays at z-20 which
                  are drawn for decoration and don't have a transparent cutout. */}
              <div
                className={`absolute flex flex-col ${!selectedBorder.id.startsWith("sys_") ? "z-10" : "z-20"}`}
                style={{
                  left: slotX,
                  top: getDisplaySlotY(
                    selectedBorder.photoAlign || "center",
                    canvasSize.h,
                  ),
                  width: slotW,
                  height: slotH,
                  gap: `${slotGap}px`,
                  transition: "top 0.3s ease",
                }}
              >
                {Array.from({ length: photoCount }).map((_, idx) => {
                  const singleSlotH =
                    (slotH - (photoCount - 1) * slotGap) / photoCount;
                  return (
                    <div
                      key={idx}
                      className="relative overflow-hidden"
                      style={{
                        width: slotW,
                        height: singleSlotH,
                        borderRadius: "0px",
                      }}
                    >
                      <SlotCanvas
                        idx={idx}
                        slot={slots[idx] ?? DEFAULT_SLOT}
                        slotAspectRatio={slotW / singleSlotH}
                        isSelected={activeSlot === idx}
                        showSelectionRing={photoCount > 1}
                        onSlotClick={handleSlotClick}
                        onOffsetChange={(i, o) =>
                          setSlots((p) => {
                            const n = [...p];
                            const slot = n[i];
                            if (!slot) return p;
                            const clamped = clampOffset(
                              o,
                              slot.zoom,
                              slot.aspectRatio,
                              slotW,
                              singleSlotH,
                            );
                            n[i] = { ...slot, offset: clamped };
                            return n;
                          })
                        }
                        onZoomChange={(i, z) =>
                          setSlots((p) => {
                            const n = [...p];
                            const slot = n[i];
                            if (!slot) return p;
                            const clampedOffset = clampOffset(
                              slot.offset,
                              z,
                              slot.aspectRatio,
                              slotW,
                              singleSlotH,
                            );
                            n[i] = { ...slot, zoom: z, offset: clampedOffset };
                            return n;
                          })
                        }
                        onRemove={handleRemoveSlot}
                        onSelect={setActiveSlot}
                        cameraStream={cameraStream}
                        facingMode={facingMode}
                        cameraError={cameraError}
                        onCapture={capturePhoto}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Frame overlay (custom PNG) - z-20 so it renders ON TOP of photos (z-10).
                   The exported frame PNG has a transparent hole where the photo shows through. */}
              {selectedBorder.imageUrl &&
                !selectedBorder.id.startsWith("sys_") && (
                  <img
                    src={`/api/proxy-image?url=${encodeURIComponent(selectedBorder.imageUrl)}`}
                    alt="Frame"
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none z-20"
                    draggable={false}
                  />
                )}
              {/* System frame overlays — also z-20 so they render on top of photo slots (z-10) */}
              {selectedBorder.id === "sys_polaroid" && (
                <div className="absolute inset-0 w-full h-full bg-white pointer-events-none z-0" />
              )}
              {selectedBorder.id === "sys_pink_floral" && (
                <PinkFloralFramePreview
                  eventName={eventName || ""}
                  eventDate={eventDate || ""}
                  scaleX={scaleX}
                  scaleY={scaleY}
                  width={canvasSize.w}
                  height={canvasSize.h}
                />
              )}
              {selectedBorder.id === "sys_blue_floral" && (
                <BlueFloralFramePreview
                  eventName={eventName || ""}
                  eventDate={eventDate || ""}
                  scaleX={scaleX}
                  scaleY={scaleY}
                  width={canvasSize.w}
                  height={canvasSize.h}
                />
              )}
            </div>
          </div>

          {/* ── BOTTOM — Instagram style ─────────────────────────────────────── */}
          <div className="shrink-0 pb-safe-bottom">
            {/* Hint */}
            <p
              className={cn(
                "text-center text-[10px] mb-1.5 transition-all",
                !hasAllFilled ? "text-zinc-500 animate-pulse" : "text-zinc-600",
              )}
            >
              {!hasAllFilled
                ? `${emptyCount} slot${emptyCount > 1 ? "s" : ""} remaining — tap 📷 to add`
                : "Drag to reposition · Pinch or scroll to zoom"}
            </p>

            {/* Frame picker — circular thumbnails row */}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none px-3 pb-2 snap-x">
              {allBorders.map((border) => {
                const isSelected = selectedBorder.id === border.id;
                const proxied = border.imageUrl
                  ? `/api/proxy-image?url=${encodeURIComponent(border.imageUrl)}`
                  : "";
                return (
                  <button
                    key={border.id}
                    type="button"
                    onClick={() => setSelectedBorder(border)}
                    className="flex-shrink-0 snap-start flex flex-col items-center gap-1 cursor-pointer transition-all"
                  >
                    <div
                      className={cn(
                        "size-[46px] rounded-full overflow-hidden border-[3px] transition-all duration-200",
                        "bg-zinc-800 flex items-center justify-center",
                        isSelected
                          ? "border-white scale-110 shadow-lg shadow-white/20"
                          : "border-transparent opacity-60 hover:opacity-90 hover:scale-105",
                      )}
                    >
                      {proxied ? (
                        <img
                          src={proxied}
                          alt={border.name ?? ""}
                          className="object-contain w-4/5 h-4/5"
                        />
                      ) : (
                        <span className="text-base">📸</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[8px] font-semibold w-[46px] text-center truncate",
                        isSelected ? "text-white" : "text-zinc-500",
                      )}
                    >
                      {border.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-900 bg-black/80 backdrop-blur-md shrink-0">
              {/* Bottom Left: Gallery Import */}
              <button
                type="button"
                onClick={handleGalleryImportClick}
                className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white active:text-white active:scale-95 transition-all cursor-pointer select-none"
              >
                <div className="size-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-850 transition-colors">
                  <ImageIcon className="size-5" />
                </div>
                <span className="text-[10px] font-semibold tracking-wide">Gallery</span>
              </button>

              {/* Bottom Center: Capture Button */}
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraStream}
                className={cn(
                  "size-[72px] rounded-full border-[4px] border-white flex items-center justify-center bg-white/10 backdrop-blur-sm",
                  "active:scale-95 transition-all shadow-xl disabled:opacity-40 disabled:scale-100 select-none",
                )}
              >
                <div className="size-[54px] rounded-full bg-white flex items-center justify-center active:bg-zinc-200 transition-colors">
                  <span className="text-xl">📷</span>
                </div>
              </button>

              {/* Bottom Right: Flip Camera */}
              <button
                type="button"
                onClick={toggleCamera}
                disabled={!cameraStream}
                className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white active:text-white active:scale-95 transition-all cursor-pointer disabled:opacity-40 select-none"
              >
                <div className="size-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-850 transition-colors">
                  <CameraRotateIcon className="size-5" />
                </div>
                <span className="text-[10px] font-semibold tracking-wide">Flip</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* ── DETAILS STEP ──────────────────────────────────────────────────── */
        <div className="flex flex-col h-full">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => setStep("compose")}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <span className="text-xs font-bold text-zinc-200">
              Sign &amp; Share
            </span>
            <div className="w-12" />
          </div>

          {/* Preview thumbnail + form */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
            {/* Mini photo preview */}
            <div className="flex gap-3 items-start">
              <div
                className="shrink-0 rounded-md overflow-hidden bg-zinc-900 border border-zinc-700"
                style={{ width: 52, aspectRatio: "9/16" }}
              >
                {slots[0]?.previewUrl && (
                  <img
                    src={slots[0].previewUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 space-y-1 pt-1">
                <p className="text-xs font-semibold text-zinc-200">
                  Almost there!
                </p>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Add your name and an optional wish before sharing to the
                  memory wall.
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="ig-guest-name"
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500"
              >
                Your Name *
              </label>
              <input
                id="ig-guest-name"
                type="text"
                required
                maxLength={50}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                disabled={isUploading}
                placeholder="Enter your name..."
                autoComplete="given-name"
                className={cn(
                  "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3",
                  "text-sm text-white placeholder:text-zinc-600",
                  "focus:outline-none focus:border-zinc-400 transition-colors",
                )}
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label
                htmlFor="ig-message"
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500"
              >
                Leave a Wish
                <span className="ml-1 normal-case font-normal text-zinc-700">
                  (optional)
                </span>
              </label>
              <textarea
                id="ig-message"
                maxLength={200}
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isUploading}
                placeholder="Write something heartfelt..."
                className={cn(
                  "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3",
                  "text-sm text-white placeholder:text-zinc-600 resize-none",
                  "focus:outline-none focus:border-zinc-400 transition-colors",
                )}
              />
              <p className="text-right text-[9px] text-zinc-700">
                {message.length}/200
              </p>
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <SpinnerGapIcon className="size-3 animate-spin text-white" />
                    {uploadProgress < 40
                      ? "Preparing…"
                      : uploadProgress < 90
                        ? "Uploading photo…"
                        : "Finishing up…"}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit bar */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 px-4 pb-safe-bottom pb-5 pt-3 border-t border-zinc-800"
          >
            <button
              type="submit"
              disabled={isUploading || !guestName.trim()}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2",
                "active:scale-[0.98] transition-all cursor-pointer",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              )}
              style={
                customButtonBg
                  ? {
                      backgroundColor: customButtonBg,
                      color: customButtonText ?? "#fff",
                    }
                  : { backgroundColor: "#fff", color: "#000" }
              }
            >
              {isUploading ? (
                <>
                  <SpinnerGapIcon className="size-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <PaperPlaneRightIcon weight="fill" className="size-4" />
                  Share to Memory Wall
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
