"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  CameraIcon,
  TrashIcon,
  SparkleIcon,
  ArrowRightIcon,
  SpinnerGapIcon,
  InfoIcon
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface BorderItem {
  id: string;
  name: string | null;
  imageKey: string;
  layoutType: string;
  photoAlign?: string;
  imageUrl: string;
}

interface InstagramEditorProps {
  eventId: string;
  borders: BorderItem[];
  customButtonBg?: string;
  customButtonText?: string;
  onSubmit: (data: {
    guestName: string;
    message: string;
    flattenedBlob: Blob;
    fileName: string;
  }) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

interface PhotoSlotState {
  file: File | null;
  previewUrl: string;
  zoom: number; // 1 to 3
  offset: { x: number; y: number };
  aspectRatio: number; // width / height
}

const DEFAULT_SLOT_STATE: PhotoSlotState = {
  file: null,
  previewUrl: "",
  zoom: 1,
  offset: { x: 0, y: 0 },
  aspectRatio: 1
};

export function InstagramEditor({
  borders = [],
  customButtonBg,
  customButtonText,
  onSubmit,
  isUploading,
  uploadProgress
}: InstagramEditorProps) {
  // 1. Combine system default frames and admin-uploaded borders
  const allBorders = React.useMemo(() => {
    const systemDefaults: BorderItem[] = [
      {
        id: "sys_polaroid",
        name: "Classic Polaroid",
        imageKey: "",
        layoutType: "single_square",
        imageUrl: "" // Drawn programmatically
      },
      {
        id: "sys_strip_dark",
        name: "Dark Retro Strip",
        imageKey: "",
        layoutType: "three_strip",
        imageUrl: "" // Drawn programmatically
      },
      {
        id: "sys_strip_light",
        name: "Classic Photo Strip",
        imageKey: "",
        layoutType: "three_strip",
        imageUrl: "" // Drawn programmatically
      }
    ];
    return [...systemDefaults, ...borders];
  }, [borders]);

  // Selected border state
  const [selectedBorder, setSelectedBorder] = React.useState<BorderItem>(allBorders[0]);

  // Editor states
  const [guestName, setGuestName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [slots, setSlots] = React.useState<PhotoSlotState[]>([
    { ...DEFAULT_SLOT_STATE },
    { ...DEFAULT_SLOT_STATE },
    { ...DEFAULT_SLOT_STATE }
  ]);

  // Selected slot for details adjustment
  const [selectedSlotIdx, setSelectedSlotIdx] = React.useState<number>(0);

  // Drag & gesture states
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [baseOffset, setBaseOffset] = React.useState({ x: 0, y: 0 });

  // Touch pinch states
  const [touchStartDist, setTouchStartDist] = React.useState<number | null>(null);
  const [touchStartZoom, setTouchStartZoom] = React.useState<number>(1);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const slotsContainerRef = React.useRef<HTMLDivElement>(null);
  const activeSlotIdxRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setTimeout(() => {
      setSlots([
        { ...DEFAULT_SLOT_STATE },
        { ...DEFAULT_SLOT_STATE },
        { ...DEFAULT_SLOT_STATE }
      ]);
      setSelectedSlotIdx(0);
    }, 0);
  }, [selectedBorder.layoutType]);

  const layoutType = selectedBorder.layoutType; // "single_square" | "single_portrait" | "three_strip"
  const requiredSlotsCount = layoutType === "three_strip" ? 3 : 1;
  const isStrip = layoutType === "three_strip";

  // Handles clicking a slot to trigger file picker
  const triggerSlotUpload = (idx: number) => {
    activeSlotIdxRef.current = idx;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const activeIdx = activeSlotIdxRef.current;
    if (selectedFile && activeIdx !== null) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please upload an image file.");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Image must be smaller than 10MB.");
        return;
      }

      const localUrl = URL.createObjectURL(selectedFile);
      const img = new Image();
      img.src = localUrl;
      img.onload = () => {
        const ratio = img.width / img.height;
        setSlots((prev) => {
          const copy = [...prev];
          copy[activeIdx] = {
            file: selectedFile,
            previewUrl: localUrl,
            zoom: 1.0,
            offset: { x: 0, y: 0 },
            aspectRatio: ratio
          };
          return copy;
        });
        setSelectedSlotIdx(activeIdx);
      };
      
      activeSlotIdxRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSlots((prev) => {
      const copy = [...prev];
      if (copy[idx].previewUrl) {
        URL.revokeObjectURL(copy[idx].previewUrl);
      }
      copy[idx] = { ...DEFAULT_SLOT_STATE };
      return copy;
    });
  };

  // Mouse drag handlers
  const handleMouseDown = (idx: number, e: React.MouseEvent) => {
    if (!slots[idx].file) return;
    e.preventDefault();
    setDragIdx(idx);
    setSelectedSlotIdx(idx);
    setDragStart({ x: e.clientX, y: e.clientY });
    setBaseOffset({ x: slots[idx].offset.x, y: slots[idx].offset.y });
  };

  // Unified multi-touch gesture handlers (Simultaneous Drag & Pinch Zoom)
  const handleTouchStart = (idx: number, e: React.TouchEvent) => {
    if (!slots[idx].file) return;
    setSelectedSlotIdx(idx);

    if (e.touches.length === 2) {
      // Pinch gesture initialized
      const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      setTouchStartDist(dist);
      setTouchStartZoom(slots[idx].zoom);
      setDragStart(mid); // Treat midpoint as drag start anchor
      setBaseOffset({ x: slots[idx].offset.x, y: slots[idx].offset.y });
      setDragIdx(idx);
    } else if (e.touches.length === 1) {
      // Single finger drag initialized
      const touch = e.touches[0];
      setDragIdx(idx);
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setBaseOffset({ x: slots[idx].offset.x, y: slots[idx].offset.y });
      setTouchStartDist(null);
    }
  };

  const handleTouchMove = (idx: number, e: React.TouchEvent) => {
    if (!slots[idx].file || dragIdx !== idx) return;

    if (e.touches.length === 2 && touchStartDist !== null) {
      e.preventDefault(); // Stop mobile viewport scrolling / default zoom
      
      const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      const scaleChange = dist / touchStartDist;
      // Allow wide zoom range: 0.5x to 5.0x
      const newZoom = Math.min(5, Math.max(0.5, touchStartZoom * scaleChange));
      
      // Calculate offset shifts based on midpoint movement
      const dx = mid.x - dragStart.x;
      const dy = mid.y - dragStart.y;

      setSlots((prev) => {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          zoom: newZoom,
          offset: {
            x: baseOffset.x + dx,
            y: baseOffset.y + dy
          }
        };
        return copy;
      });
    } else if (e.touches.length === 1 && touchStartDist === null) {
      e.preventDefault(); // Stop mobile viewport scrolling
      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.x;
      const dy = touch.clientY - dragStart.y;

      setSlots((prev) => {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          offset: {
            x: baseOffset.x + dx,
            y: baseOffset.y + dy
          }
        };
        return copy;
      });
    }
  };

  const handleTouchEnd = (idx: number, e: React.TouchEvent) => {
    // If one finger remains, seamlessly transition back to dragging
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setBaseOffset({ x: slots[idx].offset.x, y: slots[idx].offset.y });
      setTouchStartDist(null);
    } else if (e.touches.length === 0) {
      setDragIdx(null);
      setTouchStartDist(null);
    }
  };

  const handleWheel = (idx: number, e: React.WheelEvent) => {
    if (!slots[idx].file) return;
    e.preventDefault();
    const zoomFactor = 0.05;
    const change = -e.deltaY > 0 ? zoomFactor : -zoomFactor;
    setSlots((prev) => {
      const copy = [...prev];
      const newZoom = Math.min(5, Math.max(0.5, copy[idx].zoom + change));
      copy[idx] = { ...copy[idx], zoom: newZoom };
      return copy;
    });
  };

  // Global window listeners for mouse moves
  React.useEffect(() => {
    if (dragIdx === null) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setSlots((prev) => {
        const copy = [...prev];
        copy[dragIdx] = {
          ...copy[dragIdx],
          offset: {
            x: baseOffset.x + dx,
            y: baseOffset.y + dy
          }
        };
        return copy;
      });
    };

    const handleWindowMouseUp = () => {
      setDragIdx(null);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [dragIdx, dragStart, baseOffset]);

  const updateZoom = (idx: number, val: number) => {
    setSlots((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], zoom: val };
      return copy;
    });
  };

  // Validate form
  const isFormValid = React.useMemo(() => {
    const filledCount = slots.slice(0, requiredSlotsCount).filter((s) => s.file !== null).length;
    return filledCount === requiredSlotsCount && guestName.trim().length > 0 && message.trim().length > 0;
  }, [slots, requiredSlotsCount, guestName, message]);

  // Final Canvas submit
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      const width = 1080;
      let height = 1080;
      if (layoutType === "single_portrait") {
        height = 1350;
      } else if (layoutType === "three_strip") {
        height = 1920;
      } else if (selectedBorder.id === "sys_polaroid") {
        height = 1300;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw background base
      ctx.fillStyle = selectedBorder.id === "sys_strip_dark" ? "#1C1917" : "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Define slots coordinates (percentage-accurate coordinates)
      let canvasSlots: { x: number; y: number; w: number; h: number }[] = [];
      if (layoutType === "three_strip") {
        canvasSlots = [
          { x: 80, y: 160, w: 920, h: 480 },
          { x: 80, y: 680, w: 920, h: 480 },
          { x: 80, y: 1200, w: 920, h: 480 }
        ];
      } else if (selectedBorder.id === "sys_polaroid") {
        canvasSlots = [{ x: 60, y: 60, w: 960, h: 960 }];
      } else {
        canvasSlots = [{ x: 0, y: 0, w: width, h: height }];
      }

      // Draw photos
      for (let i = 0; i < requiredSlotsCount; i++) {
        const slot = slots[i];
        const canvasSlot = canvasSlots[i];
        if (!slot.file || !slot.previewUrl) continue;

        // Get container DOM width dynamically to compute relative offsets
        const slotEl = slotsContainerRef.current?.querySelector(`[data-slot-idx="${i}"]`);
        const screenW = slotEl ? slotEl.clientWidth : 240;

        const img = new Image();
        img.src = slot.previewUrl;
        await new Promise((resolve) => (img.onload = resolve));

        ctx.save();
        ctx.beginPath();
        ctx.rect(canvasSlot.x, canvasSlot.y, canvasSlot.w, canvasSlot.h);
        ctx.clip();

        // Calculate aspect ratios & cover sizes
        const slotRatio = canvasSlot.w / canvasSlot.h;
        let drawW = canvasSlot.w;
        let drawH = canvasSlot.h;
        if (slot.aspectRatio > slotRatio) {
          drawW = canvasSlot.h * slot.aspectRatio;
        } else {
          drawH = canvasSlot.w / slot.aspectRatio;
        }

        drawW *= slot.zoom;
        drawH *= slot.zoom;

        const baseX = canvasSlot.x + (canvasSlot.w - drawW) / 2;
        const baseY = canvasSlot.y + (canvasSlot.h - drawH) / 2;

        const scaleFactor = canvasSlot.w / screenW;
        const drawX = baseX + slot.offset.x * scaleFactor;
        const drawY = baseY + slot.offset.y * scaleFactor;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        if (layoutType === "three_strip") {
          ctx.strokeStyle = "rgba(0,0,0,0.15)";
          ctx.lineWidth = 4;
          ctx.strokeRect(canvasSlot.x, canvasSlot.y, canvasSlot.w, canvasSlot.h);
        }

        ctx.restore();
      }

      // Draw border overlay (Using Server CORS Proxy to prevent Tainted Canvas block)
      if (selectedBorder.imageUrl) {
        const frameImg = new Image();
        frameImg.crossOrigin = "anonymous";
        frameImg.src = `/api/proxy-image?url=${encodeURIComponent(selectedBorder.imageUrl)}`;
        await new Promise((resolve, reject) => {
          frameImg.onload = resolve;
          frameImg.onerror = () => reject(new Error("Failed loading frame border overlay image"));
        });
        ctx.drawImage(frameImg, 0, 0, width, height);
      } else {
        // System defaults
        if (selectedBorder.id === "sys_polaroid") {
          ctx.fillStyle = "rgba(0,0,0,0.06)";
          ctx.strokeRect(60, 60, 960, 960);
          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 32px 'Caveat', cursive, Georgia";
          ctx.textAlign = "center";
          ctx.fillText(`✍️ ${guestName}`, width / 2, 1080);

          ctx.font = "italic 26px Georgia, serif";
          const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
            const words = text.split(" ");
            let line = "";
            let currentY = y;
            for (let n = 0; n < words.length; n++) {
              const testLine = line + words[n] + " ";
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + " ";
                currentY += lineHeight;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, x, currentY);
          };
          wrapText(`"${message}"`, width / 2, 1140, 900, 32);
        } else if (layoutType === "three_strip") {
          const sprocketColor = selectedBorder.id === "sys_strip_dark" ? "#090504" : "#F4F4F5";
          ctx.fillStyle = sprocketColor;

          if (selectedBorder.id === "sys_strip_dark") {
            ctx.strokeStyle = "#27272A";
            ctx.lineWidth = 8;
            ctx.strokeRect(80, 160, 920, 480);
            ctx.strokeRect(80, 680, 920, 480);
            ctx.strokeRect(80, 1200, 920, 480);
          } else {
            ctx.strokeStyle = "#E4E4E7";
            ctx.lineWidth = 6;
            ctx.strokeRect(80, 160, 920, 480);
            ctx.strokeRect(80, 680, 920, 480);
            ctx.strokeRect(80, 1200, 920, 480);
          }

          const sprocketCount = 14;
          ctx.fillStyle = selectedBorder.id === "sys_strip_dark" ? "#0A0A0A" : "#FFFFFF";
          for (let s = 0; s < sprocketCount; s++) {
            const yOffset = 80 + s * 130;
            ctx.fillRect(25, yOffset, 30, 40);
            ctx.fillRect(width - 55, yOffset, 30, 40);
          }

          ctx.fillStyle = selectedBorder.id === "sys_strip_dark" ? "#F4F4F5" : "#18181B";
          ctx.font = "bold 32px Georgia, serif";
          ctx.textAlign = "center";
          ctx.fillText("📷 GUESTBOOK MOMENTS", width / 2, 90);

          ctx.fillStyle = selectedBorder.id === "sys_strip_dark" ? "#A1A1AA" : "#71717A";
          ctx.font = "italic 28px 'Caveat', cursive, Georgia";
          ctx.fillText(`signed by ${guestName}`, width / 2, 1780);
        }
      }

      // Export Blob
      const jpegBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92);
      });

      if (!jpegBlob) throw new Error("Canvas compilation failed");

      const uniqueFileName = `submission-${Date.now()}.jpg`;
      await onSubmit({
        guestName: guestName.trim(),
        message: message.trim(),
        flattenedBlob: jpegBlob,
        fileName: uniqueFileName
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to compile your photo frame. Please try again.");
    }
  };

  // Percent style mappings for exact slot alignments
  const getSlotStyle = (idx: number) => {
    if (layoutType === "three_strip") {
      const topOffset = idx === 0 ? "8.333%" : idx === 1 ? "35.417%" : "62.5%";
      return {
        position: "absolute" as const,
        top: topOffset,
        left: "7.407%",
        width: "85.185%",
        height: "25%",
      };
    } else if (selectedBorder.id === "sys_polaroid") {
      return {
        position: "absolute" as const,
        top: "4.615%",
        left: "5.556%",
        width: "88.889%",
        height: "73.846%",
      };
    } else {
      return {
        position: "absolute" as const,
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      };
    }
  };

  return (
    <form onSubmit={handleFinalSubmit} className="flex flex-col flex-1 h-full select-none bg-zinc-950 text-zinc-100 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-none">
        
        {/* Visual Viewport Viewport (Instagram Stories style floating viewport container) */}
        <div className="flex flex-col items-center justify-center pt-2">
          {/* Main Visual Frame Box */}
          <div
            ref={slotsContainerRef}
            className={cn(
              "w-full max-w-[260px] mx-auto bg-white border border-neutral-200 shadow-2xl rounded-lg relative overflow-hidden select-none",
              selectedBorder.id === "sys_strip_dark" ? "bg-stone-950 border-stone-900 text-stone-100" : "text-slate-800"
            )}
            style={{
              aspectRatio: layoutType === "three_strip" ? "1080/1920" :
                           selectedBorder.id === "sys_polaroid" ? "1080/1300" :
                           layoutType === "single_portrait" ? "1080/1350" : "1/1"
            }}
          >
            {/* Slots mapping */}
            {Array.from({ length: requiredSlotsCount }).map((_, idx) => {
              const slot = slots[idx];
              const hasPhoto = slot.file !== null;
              const slotRatio = isStrip ? 1.916 : layoutType === "single_portrait" ? 0.8 : 1.0;
              const isImageLandscape = slot.aspectRatio > slotRatio;
              const isSelected = selectedSlotIdx === idx;

              return (
                <div
                  key={idx}
                  style={getSlotStyle(idx)}
                  className={cn(
                    "group transition-all duration-200 overflow-hidden",
                    isSelected && requiredSlotsCount > 1 ? "ring-2 ring-yellow-450 z-30" : ""
                  )}
                >
                  <div
                    data-slot-idx={idx}
                    onClick={() => !hasPhoto && triggerSlotUpload(idx)}
                    onMouseDown={(e) => hasPhoto && handleMouseDown(idx, e)}
                    onTouchStart={(e) => hasPhoto && handleTouchStart(idx, e)}
                    onTouchMove={(e) => hasPhoto && handleTouchMove(idx, e)}
                    onTouchEnd={(e) => hasPhoto && handleTouchEnd(idx, e)}
                    onWheel={(e) => hasPhoto && handleWheel(idx, e)}
                    className={cn(
                      "relative w-full h-full overflow-hidden border border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center select-none cursor-pointer transition-all hover:bg-neutral-150/50",
                      hasPhoto ? "border-solid border-neutral-200 cursor-grab active:cursor-grabbing bg-zinc-900" : "",
                      selectedBorder.id === "sys_strip_dark" ? "border-stone-800 bg-stone-900" : ""
                    )}
                    style={{ touchAction: "none" }}
                  >
                    {hasPhoto ? (
                      <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
                        <img
                          src={slot.previewUrl}
                          alt={`Slot ${idx + 1}`}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            width: isImageLandscape ? "auto" : "100%",
                            height: isImageLandscape ? "100%" : "auto",
                            maxWidth: "none",
                            maxHeight: "none",
                            transform: `translate(calc(-50% + ${slot.offset.x}px), calc(-50% + ${slot.offset.y}px)) scale(${slot.zoom})`,
                            transformOrigin: "center center",
                            userSelect: "none",
                            pointerEvents: "none"
                          }}
                        />
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={(e) => removePhoto(idx, e)}
                          className="absolute top-1.5 right-1.5 size-5 bg-black/75 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer transition-all border-none z-30 pointer-events-auto shadow-md active:scale-90"
                        >
                          <TrashIcon className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-2 gap-1 text-zinc-450 select-none">
                        <CameraIcon className="size-5 text-zinc-400" />
                        <span className="text-[8px] font-bold uppercase tracking-wider">Slot {idx + 1}</span>
                        <span className="text-[7px]">Tap to Snap</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Custom Transparent PNG Border Overlay (Safe proxy URL to bypass CORS limits) */}
            {selectedBorder.imageUrl && (
              <img
                src={`/api/proxy-image?url=${encodeURIComponent(selectedBorder.imageUrl)}`}
                alt="Frame Overlay"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none z-20"
              />
            )}

            {/* System Default: Polaroid labels */}
            {!isStrip && selectedBorder.id === "sys_polaroid" && (
              <>
                <div
                  className="absolute text-center text-slate-800 pointer-events-none font-bold"
                  style={{
                    top: "83.077%",
                    left: "5%",
                    right: "5%",
                    fontFamily: "var(--font-caveat, 'Caveat', cursive, Georgia)",
                    fontSize: "min(3.2vw, 14px)"
                  }}
                >
                  ✍️ {guestName || "Your Name"}
                </div>
                <div
                  className="absolute text-center text-slate-600 pointer-events-none italic"
                  style={{
                    top: "87.692%",
                    left: "10%",
                    right: "10%",
                    fontSize: "min(2.4vw, 10px)",
                    lineHeight: "1.2"
                  }}
                >
                  {message ? `"${message}"` : "Your wedding wish..."}
                </div>
              </>
            )}

            {/* System Default: Film Strip sprocket holes & texts */}
            {isStrip && !selectedBorder.imageUrl && (
              <>
                {/* Left Sprockets */}
                <div className="absolute left-[2.315%] top-[4.167%] bottom-[5.73%] w-[2.778%] flex flex-col justify-between pointer-events-none z-20">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className={cn("w-full aspect-[3/4] rounded-sm", selectedBorder.id === "sys_strip_dark" ? "bg-zinc-950" : "bg-neutral-100")} />
                  ))}
                </div>
                {/* Right Sprockets */}
                <div className="absolute right-[2.315%] top-[4.167%] bottom-[5.73%] w-[2.778%] flex flex-col justify-between pointer-events-none z-20">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className={cn("w-full aspect-[3/4] rounded-sm", selectedBorder.id === "sys_strip_dark" ? "bg-zinc-950" : "bg-neutral-100")} />
                  ))}
                </div>
                {/* Title */}
                <div
                  className={cn(
                    "absolute left-0 right-0 text-center font-bold font-serif tracking-widest pointer-events-none z-20",
                    selectedBorder.id === "sys_strip_dark" ? "text-stone-300" : "text-stone-800"
                  )}
                  style={{ top: "3.5%", fontSize: "min(3vw, 10px)" }}
                >
                  📷 FILM STRIP GUESTBOOK
                </div>
                {/* Signature */}
                <div
                  className={cn(
                    "absolute left-0 right-0 text-center font-['Caveat'] italic pointer-events-none z-20",
                    selectedBorder.id === "sys_strip_dark" ? "text-stone-400" : "text-stone-600"
                  )}
                  style={{ bottom: "5%", fontSize: "min(3.8vw, 13px)" }}
                >
                  signed by {guestName || "guest"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Console: Combined zoom control for selected slot */}
        {slots[selectedSlotIdx]?.file && (
          <div className="w-full max-w-[260px] mx-auto flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/80 px-3 py-2 rounded-xl transition-all duration-200">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider shrink-0">
              Zoom (Slot {selectedSlotIdx + 1})
            </span>
            <Slider
              min={0.5}
              max={5.0}
              step={0.05}
              value={[slots[selectedSlotIdx].zoom]}
              onValueChange={(val) => updateZoom(selectedSlotIdx, val[0])}
              className="cursor-pointer flex-1"
            />
          </div>
        )}

        {/* Frame Selection (Horizontal circular list like Instagram filters) */}
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
            <SparkleIcon className="size-3.5 text-yellow-450" weight="fill" />
            Select Story Filter Frame
          </Label>
          <div className="flex gap-4 overflow-x-auto py-1 scrollbar-none snap-x">
            {allBorders.map((border) => {
              const isSelected = selectedBorder.id === border.id;
              const isCustom = border.imageKey !== "";
              const proxiedThumb = border.imageUrl
                ? `/api/proxy-image?url=${encodeURIComponent(border.imageUrl)}`
                : "";

              return (
                <div
                  key={border.id}
                  onClick={() => setSelectedBorder(border)}
                  className="flex-shrink-0 snap-start flex flex-col items-center gap-1 cursor-pointer group select-none"
                >
                  <div
                    className={cn(
                      "size-16 rounded-full flex items-center justify-center overflow-hidden relative border-2 transition-all duration-300 transform group-hover:scale-105",
                      isSelected
                        ? "border-yellow-450 ring-2 ring-yellow-450/40 bg-zinc-900"
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                    )}
                  >
                    {proxiedThumb ? (
                      <img src={proxiedThumb} alt={border.name || "Frame"} className="object-contain max-h-[85%] max-w-[85%]" />
                    ) : (
                      <div className="text-[9px] text-zinc-300 font-bold font-serif uppercase tracking-tight text-center leading-none p-1">
                        {border.name?.split(" ").slice(0, 2).map(w => w[0]).join("")}
                      </div>
                    )}
                    {isCustom && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[6px] px-1 py-0 bg-yellow-450 text-black font-bold uppercase rounded-sm border-none scale-90">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "text-[8px] font-semibold truncate w-16 text-center tracking-tight",
                    isSelected ? "text-yellow-450 font-bold" : "text-zinc-400"
                  )}>
                    {border.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 pt-1.5">
          <div className="grid gap-1.5">
            <Label htmlFor="g-name" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Signature Name
            </Label>
            <Input
              id="g-name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Uncle Jimmy, Sarah & Jack"
              disabled={isUploading}
              maxLength={35}
              required
              className="bg-zinc-900/60 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100 text-xs h-9 placeholder:text-zinc-600 rounded-xl"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="g-wish" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Wedding Message / Wish
            </Label>
            <textarea
              id="g-wish"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a warm wedding wish. It will be printed under your photo!"
              disabled={isUploading}
              maxLength={180}
              required
              rows={2}
              className="flex min-h-[52px] w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <SpinnerGapIcon className="size-3.5 animate-spin text-yellow-450" />
                {uploadProgress < 40 ? "Assembling canvas..." : uploadProgress < 85 ? "Uploading Polaroid..." : "Hanging on wall..."}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-yellow-450 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 justify-center bg-zinc-900/40 px-3 py-1.5 rounded-xl border border-zinc-900">
          <InfoIcon className="size-3.5 text-yellow-450 shrink-0" />
          <span>Use 2 fingers to pinch zoom and drag. Scroll wheel works on desktop!</span>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* dialog footer */}
      <div className="border-t border-zinc-900 p-4 bg-zinc-950 flex justify-end shrink-0">
        <Button
          type="submit"
          disabled={isUploading || !isFormValid}
          className="w-full text-xs font-bold cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 h-10 shadow-lg rounded-full"
          style={{
            backgroundColor: customButtonBg || "#EAB308",
            color: customButtonText || "#000000"
          }}
        >
          {isUploading ? (
            <>
              <SpinnerGapIcon className="size-3.5 animate-spin" />
              Posting polaroid...
            </>
          ) : (
            <>
              Post Polaroid Memory
              <ArrowRightIcon className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
