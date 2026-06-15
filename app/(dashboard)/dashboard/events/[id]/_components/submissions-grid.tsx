"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CameraIcon,
  DownloadSimpleIcon,
  TrashIcon,
  SpinnerGapIcon
} from "@phosphor-icons/react";
import { type EventSubmission } from "./event-details-view";

interface SubmissionsGridProps {
  submissions: EventSubmission[];
  deletePending: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function SubmissionsGrid({ submissions, deletePending, onDelete }: SubmissionsGridProps) {
  const [selectedSub, setSelectedSub] = React.useState<EventSubmission | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="lg:col-span-8 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-border/20">
        <div>
          <h2 className="text-md font-bold text-foreground">Guestbook Wall</h2>
          <p className="text-[11px] text-muted-foreground">
            All guest submissions in real-time. Click any polaroid to view or delete.
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-border">
          {submissions.length} polaroids
        </Badge>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border/60 rounded-2xl bg-card/10 text-center">
          <div className="p-4 bg-muted/30 rounded-full text-muted-foreground mb-4">
            <CameraIcon className="size-8" />
          </div>
          <h3 className="font-semibold text-base text-foreground">Your guestbook is empty</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Provide the QR code to your event guests so they can start snapping photos and signing the wall!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {submissions.map((sub: EventSubmission) => (
            <Dialog key={sub.id} open={dialogOpen && selectedSub?.id === sub.id} onOpenChange={(open) => {
              setDialogOpen(open);
              if (open) setSelectedSub(sub);
            }}>
              <DialogTrigger asChild>
                <div
                  onClick={() => {
                    setSelectedSub(sub);
                    setDialogOpen(true);
                  }}
                  className="bg-card border border-border/40 hover:border-primary/20 p-4 shadow-md rounded-xl hover:shadow-xl transition-all cursor-pointer flex flex-col items-center group transform hover:-translate-y-0.5"
                >
                  {/* Polaroid Paper Frame */}
                  <div className="bg-white p-3 pb-8 w-full shadow border border-neutral-100 flex flex-col items-center rounded-sm">
                    {/* Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 border border-neutral-100">
                      <img
                        src={sub.imageUrl}
                        alt={sub.guestName}
                        className="object-cover w-full h-full filter sepia-[0.05] contrast-[1.02] group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Polaroid Signature */}
                    <div className="mt-4 text-center font-serif text-neutral-800 text-sm tracking-tight truncate w-full">
                      ✍️ {sub.guestName}
                    </div>
                  </div>

                  <div className="mt-4 w-full text-xs text-foreground/80 italic font-serif bg-muted/30 p-3 rounded-lg border border-border/30 line-clamp-3">
                    &quot;{sub.wish}&quot;
                  </div>
                  <div className="text-[10px] text-muted-foreground self-end mt-2">
                    {sub.time}
                  </div>
                </div>
              </DialogTrigger>

              {/* Polaroid Detail Dialog */}
              <DialogContent className="sm:max-w-md bg-card border-border/40">
                <DialogHeader>
                  <DialogTitle className="text-foreground text-base font-semibold">Guestbook Polaroid Page</DialogTitle>
                </DialogHeader>
                {selectedSub && (
                  <div className="flex flex-col items-center gap-4 mt-2">
                    <div className="bg-white p-4 pb-12 shadow-2xl rounded border border-neutral-100 w-full max-w-[280px]">
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 border">
                        <img
                          src={selectedSub.imageUrl}
                          alt={selectedSub.guestName}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="mt-5 text-center font-serif text-neutral-800 text-base font-semibold">
                        {selectedSub.guestName}
                      </div>
                    </div>
                    <div className="w-full bg-muted/40 p-4 rounded-xl border border-border/40 italic font-serif text-sm text-foreground/95 text-center">
                      &quot;{selectedSub.wish}&quot;
                    </div>
                    <div className="flex justify-between items-center w-full text-xs text-muted-foreground pt-2 border-t border-border/30">
                      <span>Uploaded {selectedSub.time}</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={deletePending}
                          onClick={() => onDelete(selectedSub.id).then(() => setDialogOpen(false))}
                          className="text-red-500 hover:text-red-650 hover:bg-red-500/10 gap-1 text-xs cursor-pointer"
                        >
                          {deletePending ? (
                            <SpinnerGapIcon className="size-3.5 animate-spin" />
                          ) : (
                            <TrashIcon className="size-3.5" />
                          )}
                          Delete
                        </Button>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-1" asChild>
                          <a href={selectedSub.imageUrl} download target="_blank" rel="noreferrer">
                            <DownloadSimpleIcon className="size-4" />
                            Download Photo
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
