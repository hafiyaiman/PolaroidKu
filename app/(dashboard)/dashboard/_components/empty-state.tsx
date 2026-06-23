import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon, CameraIcon, QrCodeIcon, CalendarPlusIcon } from "@phosphor-icons/react/dist/ssr";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-2xl mx-auto">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 animate-pulse" />
        <div className="relative flex items-center justify-center size-20 rounded-full border-2 border-dashed border-primary bg-primary/5 text-primary">
          <CalendarPlusIcon className="size-10" weight="duotone" />
        </div>
      </div>

      <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Create Your First Event
      </h2>
      <p className="mt-4 text-base text-muted-foreground leading-relaxed">
        Get started by setting up a digital guestbook event. Securely print your custom guestbook QR code, let guests sign in and snap gorgeous polaroids, and preserve your memories forever.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 active:scale-95 transition-all cursor-pointer"
        >
          <Link href="/dashboard/events/new" className="flex items-center gap-2">
            <PlusIcon weight="bold" className="size-5" />
            Create Guestbook Event
          </Link>
        </Button>
      </div>

      {/* Feature highlight list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 w-full text-left">
        <div className="flex gap-3 items-start p-4 rounded-xl bg-card/45 border border-border/20">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <CameraIcon className="size-5" weight="duotone" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Digital Polaroid Frame</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Upload photos styled as retro instant polaroids with personalized wishes.
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start p-4 rounded-xl bg-card/45 border border-border/20">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <QrCodeIcon className="size-5" weight="duotone" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Printable QR Setup</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Generate customizable sign-in signage instantly for guests to scan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
