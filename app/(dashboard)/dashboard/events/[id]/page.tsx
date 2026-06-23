import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getEventDetails } from "../_actions/event-actions";
import { EventDetailsView } from "./_components/event-details-view";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const res = await getEventDetails(id);
  if (res.error || !res.event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[400px] gap-4">
        <div className="size-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 animate-bounce">
          <span className="text-xl">⚠️</span>
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Event Not Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {res.error || "This event could not be found or you do not have permission to view it."}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="cursor-pointer">
          <Link href="/dashboard/events">
            Back to Events
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-muted-foreground animate-pulse">Loading event details...</div>}>
      <EventDetailsView
        id={id}
        initialEvent={res.event}
        initialSubmissions={res.submissions || []}
        initialBorders={res.borders || []}
      />
    </Suspense>
  );
}
