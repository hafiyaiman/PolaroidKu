"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PaperPlaneRightIcon, SpinnerGapIcon } from "@phosphor-icons/react";

interface EditorFormProps {
  guestName: string;
  message: string;
  isUploading: boolean;
  uploadProgress: number;
  hasAllSlotsFilled: boolean;
  customButtonBg?: string;
  customButtonText?: string;
  onGuestNameChange: (v: string) => void;
  onMessageChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditorForm({
  guestName,
  message,
  isUploading,
  uploadProgress,
  hasAllSlotsFilled,
  customButtonBg,
  customButtonText,
  onGuestNameChange,
  onMessageChange,
  onSubmit,
}: EditorFormProps) {
  const btnStyle = customButtonBg
    ? { backgroundColor: customButtonBg, color: customButtonText || "#fff" }
    : undefined;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 px-1">
      <div className="grid gap-1">
        <Label htmlFor="guest-name" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Your Name *
        </Label>
        <Input
          id="guest-name"
          required
          maxLength={50}
          placeholder="Enter your name..."
          value={guestName}
          onChange={(e) => onGuestNameChange(e.target.value)}
          disabled={isUploading}
          className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-600 text-sm h-9 focus-visible:ring-yellow-400/50 focus-visible:border-yellow-400/50"
        />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="guest-message" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Leave a Wish <span className="text-zinc-600 normal-case font-normal">(optional)</span>
        </Label>
        <Textarea
          id="guest-message"
          maxLength={200}
          rows={2}
          placeholder="Write a heartfelt message..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          disabled={isUploading}
          className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-600 text-sm resize-none focus-visible:ring-yellow-400/50 focus-visible:border-yellow-400/50"
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] text-zinc-500">
            <span className="flex items-center gap-1">
              <SpinnerGapIcon className="size-3 animate-spin text-yellow-400" />
              {uploadProgress < 40 ? "Preparing..." : uploadProgress < 90 ? "Uploading photo..." : "Saving..."}
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isUploading || !guestName.trim() || !hasAllSlotsFilled}
        className={cn(
          "w-full font-bold text-sm h-11 flex items-center justify-center gap-2",
          "cursor-pointer active:scale-95 transition-all duration-150",
          !customButtonBg && "bg-gradient-to-br from-yellow-400 to-orange-400 text-zinc-950 hover:from-yellow-300 hover:to-orange-300"
        )}
        style={btnStyle}
      >
        {isUploading ? (
          <>
            <SpinnerGapIcon className="size-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <PaperPlaneRightIcon weight="fill" className="size-4" />
            Share to Gallery
          </>
        )}
      </Button>

      {!hasAllSlotsFilled && !isUploading && (
        <p className="text-center text-[9px] text-zinc-600">
          Add photos to all slots before sharing
        </p>
      )}
    </form>
  );
}
