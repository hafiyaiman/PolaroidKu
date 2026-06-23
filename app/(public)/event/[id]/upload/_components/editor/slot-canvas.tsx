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

  return (
    <div
      data-slot-idx={idx}
      onClick={() => !hasPhoto && onSlotClick(idx)}
      onMouseDown={hasPhoto ? handleMouseDown : undefined}
      onTouchStart={hasPhoto ? handleTouchStart : undefined}
      onTouchMove={hasPhoto ? handleTouchMove : undefined}
      onTouchEnd={hasPhoto ? handleTouchEnd : undefined}
      onWheel={hasPhoto ? handleWheel : undefined}
      className={cn(
        "relative w-full h-full overflow-hidden select-none transition-all",
        hasPhoto
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-pointer bg-zinc-800 border-2 border-dashed border-zinc-600 flex flex-col items-center justify-center hover:bg-zinc-750",
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
      ) : (
        <div className="flex flex-col items-center gap-1 text-zinc-500 pointer-events-none">
          <CameraIcon className="size-6" />
          <span className="text-[9px] font-bold uppercase tracking-wider">
            Photo {idx + 1}
          </span>
          <span className="text-[8px]">Tap to add</span>
        </div>
      )}
    </div>
  );
}
