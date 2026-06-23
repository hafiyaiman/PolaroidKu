"use client";

import * as React from "react";
import { ClassicTemplate } from "./templates/classic-template";
import { ElegantTemplate } from "./templates/elegant-template";
import { CoverTemplate } from "./templates/cover-template";
import { DarkCoverTemplate } from "./templates/dark-cover-template";

export interface GuestLandingTemplateProps {
  template: string;
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

// Calculate high contrast text color (black or white) for buttons
export function getContrastColor(hexColor: string) {
  if (!hexColor) return "#FFFFFF";
  const color = hexColor.startsWith("#") ? hexColor.slice(1) : hexColor;
  if (color.length !== 6) return "#FFFFFF";
  
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#0F172A" : "#FFFFFF";
}

export function GuestLandingTemplate(props: GuestLandingTemplateProps) {
  const { template } = props;

  switch (template) {
    case "elegant":
      return <ElegantTemplate {...props} />;
    case "cover":
      return <CoverTemplate {...props} />;
    case "dark-cover":
      return <DarkCoverTemplate {...props} />;
    case "classic":
    default:
      return <ClassicTemplate {...props} />;
  }
}
