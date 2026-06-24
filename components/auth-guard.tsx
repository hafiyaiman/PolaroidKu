"use client";

import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: sessionState, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending && !sessionState?.user) {
      router.push("/login");
    }
  }, [isPending, sessionState, router]);

  if (isPending) {
    return (
      <div className="flex h-svh w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-pink-500" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  if (!sessionState?.user) {
    return null;
  }

  return <>{children}</>;
}
