"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, LockKeyIcon } from "@phosphor-icons/react";
import { AdminStats } from "./_components/admin-stats";
import { RevenueChart } from "./_components/revenue-chart";
import { ArchitectureStatus } from "./_components/architecture-status";
import { AdminLogs } from "./_components/admin-logs";
import { useAdminOverview } from "./_hooks/use-admin";
import { Loader2 } from "lucide-react";

export default function Page() {
  const { data: overviewData, isLoading, error } = useAdminOverview();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-pink-500" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Loading system overview...</p>
        </div>
      </div>
    );
  }

  if (error || !overviewData) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30">
        <Card className="max-w-md w-full border-border/40 bg-card/60 text-center shadow-lg">
          <CardHeader className="flex flex-col items-center gap-2 pt-6">
            <div className="size-12 rounded-full bg-destructive/15 flex items-center justify-center text-destructive">
              <LockKeyIcon className="size-6" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground mt-2">
              Super Admin Access Required
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground px-2">
              You do not have the required permissions to view the Super Admin Overview. Access is restricted to Super Administrators only.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-6">
            <Link href="/dashboard" passHref legacyBehavior>
              <Button className="cursor-pointer text-xs">
                Return to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const {
    totalUsers,
    activeEvents,
    totalPhotos,
    totalRevenue,
    conversionRate,
    chartData,
    maxVal,
    formattedLogs,
    bucketName,
  } = overviewData;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Super Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time platform financial performance metrics and system architecture integrity indicators.
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold px-3 py-1">
          Platform Master Mode
        </Badge>
      </div>

      {/* Global stats grid */}
      <AdminStats
        totalUsers={totalUsers}
        activeEvents={activeEvents}
        totalPhotos={totalPhotos}
        totalRevenue={totalRevenue}
        conversionRate={conversionRate}
      />

      {/* Revenue Chart Section (Full Width, Spans 12 columns) */}
      <div className="grid gap-6 lg:grid-cols-12">
        <RevenueChart chartData={chartData} maxVal={maxVal} />

        <ArchitectureStatus bucketName={bucketName} />
      </div>

      <AdminLogs formattedLogs={formattedLogs} />

      {/* Super admin control links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/30 border-border/30 hover:border-pink-500/20 transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground">Manage Platform Users</CardTitle>
            <CardDescription>Edit subscription roles, inspect user buckets, or manage accounts.</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <Button asChild variant="outline" className="border-border/60 hover:bg-muted text-xs cursor-pointer">
              <Link href="/dashboard/admin/users" className="flex items-center gap-1">
                Go to User Directory
                <ArrowRightIcon className="size-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/30 border-border/30 hover:border-pink-500/20 transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground">Global Billing & Revenue Console</CardTitle>
            <CardDescription>Inspect payment integrations, update billing logs, or view invoices.</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <Button asChild variant="outline" className="border-border/60 hover:bg-muted text-xs cursor-pointer">
              <Link href="/dashboard/admin/billing" className="flex items-center gap-1">
                Go to Billing Control
                <ArrowRightIcon className="size-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
