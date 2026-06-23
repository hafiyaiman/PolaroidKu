"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SparkleIcon } from "@phosphor-icons/react";

export interface BorderItem {
  id: string;
  name: string | null;
  imageKey: string;
  layoutType: string; // "single_square" | "single_portrait" | "three_strip"
  photoAlign?: string; // "top" | "center" | "bottom"
  imageUrl: string;
}

export const SYSTEM_BORDERS: BorderItem[] = [
  { id: "sys_polaroid", name: "Polaroid", imageKey: "", layoutType: "story_916", imageUrl: "" },
];

interface FramePickerProps {
  borders: BorderItem[];
  selected: BorderItem;
  onSelect: (border: BorderItem) => void;
}

const LAYOUT_EMOJI: Record<string, string> = {
  story_916: "📸",
  single_square: "⬜",
  single_portrait: "📱",
  three_strip: "🎞️",
};

export function FramePicker({ borders, selected, onSelect }: FramePickerProps) {
  const all = React.useMemo(() => [...SYSTEM_BORDERS, ...borders], [borders]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <SparkleIcon className="size-3.5 text-yellow-400" weight="fill" />
        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Select Frame</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x px-1">
        {all.map((border) => {
          const isSelected = selected.id === border.id;
          const isCustom = border.imageKey !== "";
          const proxiedUrl = border.imageUrl
            ? `/api/proxy-image?url=${encodeURIComponent(border.imageUrl)}`
            : "";

          return (
            <button
              key={border.id}
              type="button"
              onClick={() => onSelect(border)}
              className={cn(
                "flex-shrink-0 snap-start flex flex-col items-center gap-1.5",
                "cursor-pointer group transition-all duration-200"
              )}
            >
              <div
                className={cn(
                  "size-[60px] rounded-full overflow-hidden relative border-[2.5px] transition-all duration-300",
                  "flex items-center justify-center bg-zinc-800 transform group-hover:scale-105",
                  isSelected
                    ? "border-yellow-400 ring-2 ring-yellow-400/30 scale-110"
                    : "border-zinc-700 hover:border-zinc-500"
                )}
              >
                {proxiedUrl ? (
                  <img
                    src={proxiedUrl}
                    alt={border.name || "Frame"}
                    className="object-contain w-4/5 h-4/5"
                  />
                ) : (
                  <span className="text-xl" role="img">
                    {LAYOUT_EMOJI[border.layoutType] || "🖼️"}
                  </span>
                )}
                {isCustom && (
                  <Badge className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] px-1 py-0 bg-yellow-400 text-black font-bold uppercase rounded-xs border-none">
                    Custom
                  </Badge>
                )}
              </div>

              <span
                className={cn(
                  "text-[9px] font-semibold w-[60px] text-center truncate leading-tight",
                  isSelected ? "text-yellow-400" : "text-zinc-400"
                )}
              >
                {border.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
