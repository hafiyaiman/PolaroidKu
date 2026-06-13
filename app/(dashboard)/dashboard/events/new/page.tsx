import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { NewEventForm } from "./_components/new-event-form";

export default async function Page() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }

  return <NewEventForm />;
}
