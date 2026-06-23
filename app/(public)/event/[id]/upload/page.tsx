import { getPublicEventDetails } from "@/app/actions/guest-actions";
import { UploadForm } from "./_components/upload-form";

export default async function GuestUploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const res = await getPublicEventDetails(id);

  if (res.error || !res.event) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <div className="size-16 bg-destructive/10 border border-destructive/20 rounded-full flex items-center justify-center text-destructive mb-4 animate-bounce">
          <span className="text-xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Access Denied</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          {res.error || "We couldn't load this guestbook event. Please scan a valid event QR code."}
        </p>
      </div>
    );
  }

  return (
    <UploadForm
      id={id}
      initialEvent={res.event}
      initialBorders={res.borders || []}
      initialSubmissions={res.submissions || []}
    />
  );
}
