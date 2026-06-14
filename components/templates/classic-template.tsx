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
  onAction?: () => void;
  isPreview?: boolean;
}

export function ClassicTemplate({
  preheader,
  eventName,
  subheader,
  coverImageUrl,
  buttonShape,
  textColor,
  buttonColor,
  buttonTextColor,
  bgColor,
  onAction,
  isPreview = false,
}: TemplateProps) {
  const imageUrl = coverImageUrl || "/default-cover.png";

  const getButtonClass = () => {
    const base = "w-full py-3 px-6 text-sm font-semibold tracking-wide shadow-lg transition-all active:scale-95 duration-200 flex items-center justify-center gap-2 cursor-pointer border-none";
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
  const customBgStyle = bgColor ? { backgroundColor: bgColor } : {};

  return (
    <div 
      className="h-full w-full flex flex-col justify-between bg-[#FAF9F5] p-6 overflow-y-auto select-none transition-all duration-500 ease-in-out"
      style={customBgStyle}
    >
      {/* Centered Content Block */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto w-full">
        {/* Polaroid frame container */}
        <div className="bg-white p-3.5 pb-10 shadow-xl border border-neutral-200/40 rounded-sm w-full max-w-[240px] transform -rotate-1 hover:rotate-0 transition-transform duration-300 ease-out">
          <div className="relative aspect-[4/5] w-full bg-neutral-100 overflow-hidden border border-neutral-150">
            <img 
              src={imageUrl} 
              alt="Polaroid Memory" 
              className="w-full h-full object-cover object-center filter sepia-[0.04]"
            />
          </div>
          {/* Small heart indicator under image */}
          <div className="mt-3 text-neutral-300 flex justify-center">
            <HeartIcon className="size-3" weight="fill" />
          </div>
        </div>

        {/* Text Area */}
        <div className="mt-8 flex flex-col items-center">
          <span className="text-xs font-serif italic text-neutral-500" style={customTextStyle}>
            {preheader}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 font-serif mt-1" style={customTextStyle}>
            {eventName}
          </h1>
          {subheader && (
            <p className="text-xs text-neutral-400 mt-2 font-serif" style={customTextStyle}>
              {subheader}
            </p>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full max-w-sm mx-auto pb-4">
        <button
          onClick={onAction}
          disabled={isPreview}
          className={getButtonClass()}
          style={{
            backgroundColor: buttonColor || "#451a03",
            color: buttonTextColor || getContrastColor(buttonColor || "#451a03")
          }}
        >
          <CameraIcon className="size-4" weight="fill" />
          Upload Media
        </button>
      </div>
    </div>
  );
}
