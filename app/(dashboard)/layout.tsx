import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { PageTitleProvider } from "@/components/page-title-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset className="max-h-svh overflow-hidden flex flex-col">
        <PageTitleProvider>
          <DashboardHeader />
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {children}
          </div>
        </PageTitleProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
