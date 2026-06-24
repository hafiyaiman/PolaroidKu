"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SpinnerGapIcon, PaperPlaneRightIcon } from "@phosphor-icons/react";

interface EditorDetailsStepProps {
  onBack: () => void;
  guestName: string;
  setGuestName: (name: string) => void;
  message: string;
  setMessage: (msg: string) => void;
  isUploading: boolean;
  uploadProgress: number;
  handleSubmit: (e: React.FormEvent) => void;
  previewUrl?: string;
  customButtonBg?: string;
  customButtonText?: string;
}

export function EditorDetailsStep({
  onBack,
  guestName,
  setGuestName,
  message,
  setMessage,
  isUploading,
  uploadProgress,
  handleSubmit,
  previewUrl,
  customButtonBg,
  customButtonText,
}: EditorDetailsStepProps) {
  return (
    <div className="flex flex-col h-full bg-black text-white animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-zinc-800 shrink-0">
        <button
          type="button"
          onClick={onBack}
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
            {previewUrl && (
              <img
                src={previewUrl}
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
  );
}
