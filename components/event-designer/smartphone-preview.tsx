"use client";

import * as React from "react";
import { DeviceMobileIcon } from "@phosphor-icons/react";
import { GuestLandingTemplate } from "@/components/guest-landing-template";

interface SmartphonePreviewProps {
  editTemplate: string;
  editPreheader: string;
  eventName: string;
  editSubheader: string;
  eventDate: string;
  coverImageUrl: string;
  editButtonShape: string;
  editTextColor: string;
  editButtonColor: string;
  editButtonTextColor: string;
  editBgColor: string;
  editPreheaderColor?: string | null;
  editSubheaderColor?: string | null;
  isDesktop?: boolean;
}

export function SmartphonePreview({
  editTemplate,
  editPreheader,
  eventName,
  editSubheader,
  eventDate,
  coverImageUrl,
  editButtonShape,
  editTextColor,
  editButtonColor,
  editButtonTextColor,
  editBgColor,
  editPreheaderColor,
  editSubheaderColor,
  isDesktop = false,
}: SmartphonePreviewProps) {
  if (isDesktop) {
    return (
      <div className="lg:col-span-5 flex flex-col items-center justify-center py-6 bg-muted/10 border border-dashed border-border/40 rounded-2xl h-full overflow-hidden min-h-0">
        <div className="text-center mb-4 shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-center gap-1">
            <DeviceMobileIcon className="size-3.5" />
            Live Smartphone Preview
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5 px-4">
            Real-time preview of what guests will see when they visit your sign-in page.
          </p>
        </div>

        {/* Smartphone Simulator */}
        <div className="relative mx-auto flex-1 min-h-0 max-h-[640px] aspect-[340/640] w-auto bg-neutral-950 rounded-[44px] shadow-2xl border-[11px] border-neutral-900 overflow-hidden flex flex-col ring-8 ring-neutral-800/5 ring-offset-2 ring-offset-neutral-950/10">
          {/* Speaker/Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-950 rounded-full z-30 flex items-center justify-center">
            <div className="w-8 h-1 bg-neutral-800 rounded-full" />
          </div>

          {/* Screen content */}
          <div className="w-full h-full bg-background overflow-hidden relative">
            <GuestLandingTemplate
              template={editTemplate}
              preheader={editPreheader}
              eventName={eventName.trim() || "Chloe & Ryan's Wedding"}
              subheader={editSubheader || eventDate || "June 14, 2026"}
              coverImageUrl={coverImageUrl}
              buttonShape={editButtonShape}
              textColor={editTextColor}
              buttonColor={editButtonColor}
              buttonTextColor={editButtonTextColor}
              bgColor={editBgColor}
              preheaderColor={editPreheaderColor}
              subheaderColor={editSubheaderColor}
              isPreview={true}
            />
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-neutral-800 rounded-full z-30" />
        </div>
      </div>
    );
  }

  // Mobile layout preview
  return (
    <div className="relative mx-auto flex-1 min-h-0 max-h-[66vh] aspect-[9/16] w-auto rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-background">
      <GuestLandingTemplate
        template={editTemplate}
        preheader={editPreheader}
        eventName={eventName.trim() || "Chloe & Ryan's Wedding"}
        subheader={editSubheader || eventDate || "June 14, 2026"}
        coverImageUrl={coverImageUrl}
        buttonShape={editButtonShape}
        textColor={editTextColor}
        buttonColor={editButtonColor}
        buttonTextColor={editButtonTextColor}
        bgColor={editBgColor}
        preheaderColor={editPreheaderColor}
        subheaderColor={editSubheaderColor}
        isPreview={true}
      />
    </div>
  );
}
