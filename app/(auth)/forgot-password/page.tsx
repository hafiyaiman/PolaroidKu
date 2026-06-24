"use client";

import { ForgotPasswordForm } from "@/app/(auth)/forgot-password/_components/forgot-password-form";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { data: sessionState, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending && sessionState?.user) {
      router.push("/dashboard");
    }
  }, [isPending, sessionState, router]);

  if (isPending) {
    return (
      <div className="flex h-svh w-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (sessionState?.user) {
    return null;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
