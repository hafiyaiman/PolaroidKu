import { LoginForm } from "@/app/(auth)/login/_components/login-form";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const { data: session } = await auth.getSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}

