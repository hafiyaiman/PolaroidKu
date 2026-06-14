"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateEvent } from "../../_hooks/use-events";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { EventDesignerForm, type EventDesignerFormValues } from "@/components/event-designer-form";

export function NewEventForm() {
  const router = useRouter();
  
  // Client-generated unique ID for presigned direct upload folder isolation
  const [tempEventId] = React.useState(() => {
    const randomSuffix = Math.random().toString(36).substring(2, 11);
    return `event-${Date.now()}-${randomSuffix}`;
  });

  const { mutateAsync: createEventMutate, isPending } = useCreateEvent();

  const handleSubmit = async (values: EventDesignerFormValues) => {
    try {
      const res = await createEventMutate({
        id: tempEventId, // Pass Client-generated unique identifier
        name: values.name,
        date: values.date!, // date is guaranteed here as isNewEvent=true
        template: values.template,
        coverImageKey: values.coverImageKey || undefined,
        preheader: values.preheader.trim() || undefined,
        subheader: values.subheader?.trim() || undefined,
        buttonShape: values.buttonShape,
        textColor: values.textColor,
        buttonColor: values.buttonColor,
        buttonTextColor: values.buttonTextColor,
        bgColor: values.bgColor,
      });

      if (res.error) {
        toast.error(res.error);
        throw new Error(res.error);
      } else if (res.eventId) {
        toast.success("Guestbook launch completed!");
        router.push(`/dashboard/events/${res.eventId}`);
      }
    } catch (err) {
      const error = err as Error;
      console.error(error);
      toast.error(error.message || "Failed to create event. Please try again.");
      throw error;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 bg-background/30 min-h-0 overflow-hidden p-0 lg:p-6">
      {/* Back button */}
      <Button variant="ghost" asChild className="self-start text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2 shrink-0 hidden lg:inline-flex">
        <Link href="/dashboard/events" className="flex items-center gap-1">
          <ArrowLeftIcon className="size-3.5" />
          Back to Events
        </Link>
      </Button>

      {/* Unified Customizer form container */}
      <div className="flex-1 min-h-0 overflow-hidden w-full mx-auto">
        <EventDesignerForm
          eventId={tempEventId}
          isNewEvent={true}
          isPending={isPending}
          onSubmit={handleSubmit}
          submitButtonText="Launch Guestbook"
          onCancel={() => router.push("/dashboard/events")}
        />
      </div>
    </div>
  );
}
