"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CameraIcon,
  DownloadSimpleIcon,
  TrashIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";

import { type EventSubmission } from "./event-details-view";

interface SubmissionsGridProps {
  submissions: EventSubmission[];
  deletePending: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function SubmissionsGrid({
  submissions,
  deletePending,
  onDelete,
}: SubmissionsGridProps) {
  const [selectedSub, setSelectedSub] = React.useState<EventSubmission | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="lg:col-span-8 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-border/20">
        <div>
          <h2 className="text-md font-bold text-foreground">Guestbook Wall</h2>
          <p className="text-[11px] text-muted-foreground">
            All guest submissions in real-time. Click any polaroid to view or
            delete.
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-xs font-semibold px-2 py-0.5 border-border"
        >
          {submissions.length} polaroids
        </Badge>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border/60 rounded-2xl bg-card/10 text-center">
          <div className="p-4 bg-muted/30 rounded-full text-muted-foreground mb-4">
            <CameraIcon className="size-8" />
          </div>
          <h3 className="font-semibold text-base text-foreground">
            Your guestbook is empty
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Provide the QR code to your event guests so they can start snapping
            photos and signing the wall!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4 grid-cols-2">
          {submissions.map((sub: EventSubmission) => (
            <Dialog
              key={sub.id}
              open={dialogOpen && selectedSub?.id === sub.id}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (open) setSelectedSub(sub);
              }}
            >
              <DialogTrigger asChild>
                <div
                  onClick={() => {
                    setSelectedSub(sub);
                    setDialogOpen(true);
                  }}
                  className="cursor-pointer group relative overflow-hidden rounded-lg border border-border/40 bg-muted/30 hover:shadow-md transition-shadow"
                >
                  <div className="overflow-hidden bg-neutral-900">
                    <img
                      src={sub.imageUrl}
                      alt={sub.guestName}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-2 py-1.5 border-t border-border/30 bg-background/80">
                    <p className="text-[10px] font-semibold truncate">
                      {sub.guestName}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {sub.time}
                    </p>
                  </div>
                </div>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md bg-card border-border/40">
                <DialogHeader>
                  <DialogTitle className="text-foreground text-base font-semibold">
                    {selectedSub?.guestName}&apos;s Photo
                  </DialogTitle>
                </DialogHeader>
                {selectedSub && (
                  <div className="flex flex-col items-center gap-4 mt-2">
                    <div className="w-full overflow-hidden rounded-lg bg-neutral-900 border border-border/40">
                      <img
                        src={selectedSub.imageUrl}
                        alt={selectedSub.guestName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {selectedSub.wish && (
                      <p className="text-sm text-muted-foreground italic text-center">
                        &ldquo;{selectedSub.wish}&rdquo;
                      </p>
                    )}
                    <div className="flex justify-between items-center w-full text-xs text-muted-foreground pt-2 border-t border-border/30">
                      <span>Uploaded {selectedSub.time}</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={deletePending}
                          onClick={() =>
                            onDelete(selectedSub.id).then(() =>
                              setDialogOpen(false),
                            )
                          }
                          className="text-red-500 hover:bg-red-500/10 gap-1 text-xs cursor-pointer"
                        >
                          {deletePending ? (
                            <SpinnerGapIcon className="size-3.5 animate-spin" />
                          ) : (
                            <TrashIcon className="size-3.5" />
                          )}
                          Delete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary gap-1"
                          asChild
                        >
                          <a
                            href={selectedSub.imageUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                          >
                            <DownloadSimpleIcon className="size-4" />
                            Download
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
