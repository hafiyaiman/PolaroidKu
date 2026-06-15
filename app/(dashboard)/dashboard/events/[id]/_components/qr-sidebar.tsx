"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SparkleIcon, DownloadSimpleIcon, CopyIcon } from "@phosphor-icons/react";

interface QrSidebarProps {
  id: string;
  qrUrl: string;
  photoCount: number;
  photoLimit: number;
  publicUploadUrl: string;
  onCopyLink: () => void;
}

export function QrSidebar({ id, qrUrl, photoCount, photoLimit, onCopyLink }: QrSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-0">
      <Card className="bg-card/65 border-border/40 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <SparkleIcon className="size-4 text-primary" />
            Live Sign-In QR
          </CardTitle>
          <CardDescription className="text-[10px]">
            Present this QR code at your venue for guests to scan and sign.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-2">
          <div className="bg-white p-3 pb-8 shadow-md rounded border border-neutral-100 flex flex-col items-center w-full max-w-[200px] transition-transform hover:scale-[1.01]">
            <div className="bg-neutral-50 p-2 border border-neutral-200 aspect-square w-full flex items-center justify-center">
              {qrUrl ? (
                <img src={qrUrl} alt="Event QR Code" className="w-full h-full" />
              ) : (
                <div className="size-36 bg-muted animate-pulse rounded-lg" />
              )}
            </div>
            <div className="mt-3.5 text-center font-serif text-neutral-800 text-[10px] font-semibold leading-tight">
              Scan to Sign Our<br />Polaroid Guestbook
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 pt-2 pb-4">
          <Button onClick={onCopyLink} variant="outline" className="flex-1 text-[11px] gap-1 cursor-pointer h-8">
            <CopyIcon className="size-3.5" />
            Copy Link
          </Button>
          {qrUrl && (
            <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer active:scale-95 transition-all text-[11px] h-8 gap-1">
              <a href={qrUrl} download={`polaroidku-${id}-qr.png`}>
                <DownloadSimpleIcon className="size-3.5" />
                Save PNG
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card className="bg-card/65 border-border/40 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Guestbook Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground font-medium">Sign-in Limits</span>
            <span className="font-semibold text-foreground">
              {photoCount} / {photoLimit} photos
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
