"use client";

import * as React from "react";
import { HeartIcon, CameraIcon } from "@phosphor-icons/react";
import { getContrastColor } from "../guest-landing-template";

interface TemplateProps {
  preheader: string;
  eventName: string;
  subheader?: string | null;
  coverImageUrl?: string | null;
  buttonShape: string;
  textColor?: string | null;
  buttonColor?: string | null;
  buttonTextColor?: string | null;
  bgColor?: string | null;
  preheaderColor?: string | null;
  subheaderColor?: string | null;
  onAction?: () => void;
  isPreview?: boolean;
}

export function CoverTemplate({
  preheader,
  eventName,
  subheader,
  coverImageUrl,
  buttonShape,
  textColor,
  buttonColor,
  buttonTextColor,
  bgColor,
  preheaderColor,
  subheaderColor,
  onAction,
  isPreview = false,
}: TemplateProps) {
  const imageUrl = coverImageUrl || "/default-cover.png";
  const overlayColor = bgColor || "#000000";
  const opacity = 0.4;

  const getButtonClass = () => {
    const base =
      "w-full py-3 px-6 text-sm font-semibold tracking-wide shadow-lg transition-all active:scale-95 duration-200 flex items-center justify-center gap-2 cursor-pointer border-none";
    switch (buttonShape) {
      case "square":
        return `${base} rounded-none`;
      case "pill":
        return `${base} rounded-full`;
      case "rounded":
      default:
        return `${base} rounded-xl`;
    }
  };

  const customTextStyle = textColor ? { color: textColor } : {};
  const preheaderStyle = preheaderColor
    ? { color: preheaderColor }
    : customTextStyle;
  const subheaderStyle = subheaderColor
    ? { color: subheaderColor }
    : customTextStyle;

  return (
    <div
      className="relative h-full w-full flex flex-col justify-between p-6 md:p-8 bg-cover bg-center overflow-hidden select-none transition-all duration-500 ease-in-out"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      {/* Color overlay over background */}
      <div
        className="absolute inset-0 transition-colors duration-500 backdrop-blur-[2px]"
        style={{ backgroundColor: overlayColor, opacity }}
      />

      {/* Top Floating Logo / Ornament */}
      <div className="relative z-10 flex justify-center pt-4">
        <div className="size-10 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
          <HeartIcon weight="fill" className="size-4 animate-pulse" />
        </div>
      </div>

      {/* Centered Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto px-4 max-w-sm mx-auto">
        <span
          className="text-xs uppercase tracking-widest text-white/80 font-medium"
          style={preheaderStyle}
        >
          {preheader}
        </span>
        <h1
          className="text-4xl font-extrabold tracking-tight text-white mt-2 drop-shadow-sm"
          style={customTextStyle}
        >
          {eventName}
        </h1>
        {subheader && (
          <p
            className="text-sm text-white/90 font-medium mt-3 drop-shadow-sm"
            style={subheaderStyle}
          >
            {subheader}
          </p>
        )}

        {/* Decorative line */}
        <div
          className="w-12 h-0.5 my-6 rounded-full"
          style={{ backgroundColor: textColor || "rgba(255,255,255,0.4)" }}
        />
      </div>

      {/* Bottom CTA Block */}
      <div className="relative z-10 w-full max-w-sm mx-auto pb-4">
        <button
          onClick={onAction}
          disabled={isPreview}
          className={getButtonClass()}
          style={{
            backgroundColor: buttonColor || "#FFFFFF",
            color:
              buttonTextColor || getContrastColor(buttonColor || "#FFFFFF"),
          }}
        >
          <CameraIcon className="size-4" weight="fill" />
          Upload Media
        </button>
      </div>
    </div>
  );
}
