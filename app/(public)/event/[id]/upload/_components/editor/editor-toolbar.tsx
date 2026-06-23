"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { HandGrabbingIcon, MagnifyingGlassPlusIcon } from "@phosphor-icons/react";

interface EditorToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  hasPhoto: boolean;
  /** Number of empty slots */
  emptySlots: number;
}

export function EditorToolbar({ zoom, onZoomChange, hasPhoto, emptySlots }: EditorToolbarProps) {
  const hint = React.useMemo(() => {
    if (!hasPhoto) return "Tap a photo slot to add your photo";
    if (emptySlots > 0) return `${emptySlots} slot${emptySlots > 1 ? "s" : ""} remaining — tap to add`;
    return "Drag photo to reposition · Pinch or scroll to zoom";
  }, [hasPhoto, emptySlots]);

  return (
    <div className="flex flex-col gap-3 px-1">
      {/* Hint text */}
      <div className={cn(
        "flex items-center gap-1.5 text-[10px] transition-all",
        hasPhoto ? "text-zinc-400" : "text-yellow-400/80 animate-pulse"
      )}>
        {hasPhoto ? (
          <HandGrabbingIcon className="size-3.5 shrink-0" />
        ) : (
          <span className="size-3.5 shrink-0 text-center">📷</span>
        )}
        <span className="leading-tight">{hint}</span>
      </div>

      {/* Zoom control */}
      {hasPhoto && (
        <div className="flex items-center gap-3">
          <MagnifyingGlassPlusIcon className="size-3.5 text-zinc-500 shrink-0" />
          <Slider
            min={0.5}
            max={4}
            step={0.05}
            value={[zoom]}
            onValueChange={([v]) => onZoomChange(v)}
            className="flex-1"
          />
          <span className="text-[9px] font-mono text-zinc-500 w-7 text-right">
            {zoom.toFixed(1)}×
          </span>
        </div>
      )}
    </div>
  );
}
