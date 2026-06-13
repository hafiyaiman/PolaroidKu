import { ForgotPasswordForm } from "@/app/(auth)/forgot-password/_components/forgot-password-form";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function ForgotPasswordPage() {
  const { data: session } = await auth.getSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

