"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PlusIcon,
  TrashIcon,
  MagicWandIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useDeleteBorder } from "../../_hooks/use-event-details";
import { BorderBuilderDialog } from "./border-builder/border-builder-dialog";

interface BorderItem {
  id: string;
  name: string | null;
  imageKey: string;
  layoutType: string;
  photoAlign: string;
  imageUrl: string;
}

interface CustomBordersTabProps {
  eventId: string;
  borders: BorderItem[];
  builderOpen: boolean;
  onBuilderOpenChange: (open: boolean) => void;
}

export function CustomBordersTab({
  eventId,
  borders = [],
  builderOpen,
  onBuilderOpenChange,
}: CustomBordersTabProps) {
  const deleteBorder = useDeleteBorder(eventId);

  const handleAddNewFrame = () => {
    onBuilderOpenChange(true);
  };

  const handleDelete = async (id: string, name: string | null) => {
    if (
      !confirm(
        `Delete frame "${name || "Unnamed"}"? Guests can no longer use it.`,
      )
    )
      return;
    try {
      const res = await deleteBorder.mutateAsync(id);
      if (res.error) toast.error(res.error);
      else toast.success("Frame deleted.");
    } catch {
      toast.error("Failed to delete frame.");
    }
  };

  const allFrames = React.useMemo(() => {
    const systemFrames = [
      {
        id: "sys_polaroid",
        name: "Polaroid",
        imageKey: "",
        layoutType: "story_916",
        imageUrl: "",
      },
    ];
    return [...systemFrames, ...borders];
  }, [borders]);

  return (
    <div className="space-y-6">
      {/* Grid of frames */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-6">
        {allFrames.map((border) => {
          const isSystem = border.id === "sys_polaroid";
          return (
            <Card
              key={border.id}
              className="relative bg-card border-border/40 overflow-hidden flex flex-col group shadow-sm hover:shadow-md transition-shadow py-0"
            >
              <div className="relative aspect-[9/16] bg-muted/10 border-b border-border/20 flex items-center justify-center">
                {isSystem ? (
                  /* Pretty representation of Polaroid Preset */
                  <div className="relative w-full aspect-[9/16] bg-white border border-neutral-200 rounded-lg shadow-md flex flex-col p-2 select-none">
                    <div className="flex-1 bg-zinc-50 border border-dashed border-zinc-200 rounded flex flex-col items-center justify-center text-[10px] text-zinc-400 font-bold uppercase tracking-wider gap-1">
                      <SparkleIcon
                        className="size-5 text-yellow-500/80"
                        weight="fill"
                      />
                      <span>Preset</span>
                    </div>
                    <div className="h-10 shrink-0" />
                  </div>
                ) : border.imageUrl ? (
                  <img
                    src={`/api/proxy-image?url=${encodeURIComponent(border.imageUrl)}`}
                    alt={border.name || "Frame"}
                    className="relative max-h-full max-w-full object-contain z-10 drop-shadow-md"
                  />
                ) : (
                  <span className="text-4xl">🖼️</span>
                )}

                {/* Hover overlay for custom borders */}
                {!isSystem && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 items-center justify-center z-20">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(border.id, border.name)}
                      className="text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95"
                    >
                      <TrashIcon className="size-4" /> Delete
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-3 bg-card flex items-center justify-between">
                <span className="font-semibold text-xs truncate max-w-[70%]">
                  {border.name || "Unnamed Frame"}
                </span>
                <span className="text-[9px] text-muted-foreground shrink-0 uppercase tracking-wider font-mono">
                  {isSystem ? "9:16 Preset" : "Custom PNG"}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Builder dialog */}
      <BorderBuilderDialog
        eventId={eventId}
        open={builderOpen}
        onOpenChange={onBuilderOpenChange}
      />
    </div>
  );
}
