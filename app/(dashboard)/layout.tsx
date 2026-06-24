import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { PageTitleProvider } from "@/components/page-title-context";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider className="h-svh overflow-hidden">
        <AppSidebar />
        <SidebarInset className="min-h-0 overflow-hidden flex flex-col">
          <PageTitleProvider>
            <DashboardHeader />
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {children}
            </div>
          </PageTitleProvider>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
