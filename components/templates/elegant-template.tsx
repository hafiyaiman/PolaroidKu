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

export function ElegantTemplate({
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
      className="h-full w-full flex flex-col justify-between bg-neutral-50/50 overflow-y-auto select-none transition-all duration-500 ease-in-out"
      style={customBgStyle}
    >
      {/* Top Banner Cover Photo */}
      <div className="relative w-full h-[38%] overflow-hidden bg-neutral-200 border-b border-neutral-100">
        <img 
          src={imageUrl} 
          alt="Cover" 
          className="w-full h-full object-cover object-center transition-all duration-500"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t" 
          style={{ 
            backgroundImage: `linear-gradient(to top, ${bgColor || "rgba(250,250,250,0.8)"}, transparent)` 
          }} 
        />
      </div>

      {/* Content Block */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-4 max-w-sm mx-auto w-full">
        {/* Small Decorative Line */}
        <div className="w-8 h-[1px] mb-4" style={{ backgroundColor: textColor || "rgba(0,0,0,0.15)" }} />
        
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-semibold" style={customTextStyle}>
          {preheader}
        </span>
        <h1 className="text-3xl font-serif tracking-tight text-neutral-800 font-light mt-1" style={customTextStyle}>
          {eventName}
        </h1>
        {subheader && (
          <p className="text-xs text-neutral-500 tracking-wider mt-2 font-light" style={customTextStyle}>
            {subheader}
          </p>
        )}
        
        {/* Styled Border Dividers */}
        <div className="flex items-center gap-2 mt-6 w-full max-w-[180px]">
          <div className="h-[1px] flex-1 animate-pulse" style={{ backgroundColor: textColor || "rgba(0,0,0,0.1)" }} />
          <HeartIcon className="size-3.5" style={{ color: textColor || "rgba(0,0,0,0.2)" }} />
          <div className="h-[1px] flex-1 animate-pulse" style={{ backgroundColor: textColor || "rgba(0,0,0,0.1)" }} />
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="w-full max-w-sm mx-auto px-6 pb-8">
        <button
          onClick={onAction}
          disabled={isPreview}
          className={getButtonClass()}
          style={{
            backgroundColor: buttonColor || "#171717",
            color: buttonTextColor || getContrastColor(buttonColor || "#171717")
          }}
        >
          <CameraIcon className="size-4" weight="fill" />
          Upload Media
        </button>
      </div>
    </div>
  );
}
