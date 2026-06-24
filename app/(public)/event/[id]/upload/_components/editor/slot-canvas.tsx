"use client";

import * as React from "react";
import { CameraIcon, TrashIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useSlotGestures } from "./use-slot-gestures";

export interface PhotoSlotState {
  file: File | null;
  previewUrl: string;
  zoom: number;
  offset: { x: number; y: number };
  aspectRatio: number;
}

export const DEFAULT_SLOT: PhotoSlotState = {
  file: null,
  previewUrl: "",
  zoom: 1,
  offset: { x: 0, y: 0 },
  aspectRatio: 1,
};

interface SlotCanvasProps {
  idx: number;
  slot: PhotoSlotState;
  slotAspectRatio: number; // width/height ratio of the slot area
  isSelected: boolean;
  showSelectionRing: boolean;
  onSlotClick: (idx: number) => void;
  onOffsetChange: (idx: number, offset: { x: number; y: number }) => void;
  onZoomChange: (idx: number, zoom: number) => void;
  onRemove: (idx: number) => void;
  onSelect: (idx: number) => void;
  cameraStream: MediaStream | null;
  facingMode: "user" | "environment";
  cameraError: string | null;
  onCapture: () => void;
}

export function SlotCanvas({
  idx,
  slot,
  slotAspectRatio,
  isSelected,
  showSelectionRing,
  onSlotClick,
  onOffsetChange,
  onZoomChange,
  onRemove,
  onSelect,
  cameraStream,
  facingMode,
  cameraError,
  onCapture,
}: SlotCanvasProps) {
  const hasPhoto = slot.file !== null;
  const isImageLandscape = slot.aspectRatio > slotAspectRatio;

  const {
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
  } = useSlotGestures({
    slotIdx: idx,
    hasPhoto,
    zoom: slot.zoom,
    offset: slot.offset,
    onOffsetChange,
    onZoomChange,
    onSelect,
  });

  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && cameraStream && isSelected && !hasPhoto) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isSelected, hasPhoto]);

  const handleClick = (e: React.MouseEvent) => {
    if (hasPhoto) return;
    if (isSelected) {
      if (cameraError) {
        onSlotClick(idx);
      } else {
        onCapture();
      }
    } else {
      onSelect(idx);
    }
  };

  return (
    <div
      data-slot-idx={idx}
      onClick={handleClick}
      onMouseDown={hasPhoto ? handleMouseDown : undefined}
      onTouchStart={hasPhoto ? handleTouchStart : undefined}
      onTouchMove={hasPhoto ? handleTouchMove : undefined}
      onTouchEnd={hasPhoto ? handleTouchEnd : undefined}
      onWheel={hasPhoto ? handleWheel : undefined}
      className={cn(
        "relative w-full h-full overflow-hidden select-none transition-all",
        hasPhoto
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-pointer bg-zinc-900 border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center hover:bg-zinc-850",
        showSelectionRing &&
          isSelected &&
          "ring-2 ring-yellow-400 ring-inset z-10",
      )}
      style={{ touchAction: "none" }}
    >
      {hasPhoto ? (
        <>
          <img
            src={slot.previewUrl}
            alt={`Photo ${idx + 1}`}
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
              pointerEvents: "none",
            }}
            draggable={false}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(idx);
            }}
            className={cn(
              "absolute top-1.5 right-1.5 size-6 bg-black/70 text-white rounded-full",
              "flex items-center justify-center z-20 pointer-events-auto",
              "hover:bg-black active:scale-90 transition-all border-none shadow-md",
            )}
          >
            <TrashIcon className="size-3" />
          </button>
        </>
      ) : isSelected ? (
        cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 px-4 text-center gap-2">
            <CameraIcon className="size-8 text-zinc-600" />
            <span className="text-[10px] font-bold text-red-400 leading-tight">
              {cameraError}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSlotClick(idx);
              }}
              className="text-[9px] underline text-zinc-300 font-semibold"
            >
              Use Gallery instead
            </button>
          </div>
        ) : !cameraStream ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 gap-2">
            <span className="text-lg animate-spin">⏳</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">
              Starting camera...
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover pointer-events-none",
                facingMode === "user" && "scale-x-[-1]",
              )}
            />
            {/* Live indicator overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-white/90 pointer-events-none gap-1">
              <CameraIcon className="size-5 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-wider bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                Live Feed
              </span>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center gap-1 text-zinc-500 pointer-events-none">
          <CameraIcon className="size-6" />
          <span className="text-[9px] font-bold uppercase tracking-wider">
            Photo {idx + 1}
          </span>
          <span className="text-[8px]">Tap to activate camera</span>
        </div>
      )}
    </div>
  );
}
