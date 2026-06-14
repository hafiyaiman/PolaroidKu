import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { db, users, events, wishes, payments, logs } from "@/lib/db";
import { eq, count, desc, sum, gt, and, ne } from "drizzle-orm";
import { AdminStats } from "./_components/admin-stats";
import { RevenueChart } from "./_components/revenue-chart";
import { ArchitectureStatus } from "./_components/architecture-status";
import { AdminLogs } from "./_components/admin-logs";

export default async function Page() {
  // 1. Query platform statistics dynamically from database
  const [totalUsersRes] = await db.select({ value: count() }).from(users);
  const [activeEventsRes] = await db.select({ value: count() }).from(events).where(eq(events.status, "Active"));
  const [totalPhotosRes] = await db.select({ value: count() }).from(wishes);
  const [revenueRes] = await db.select({ value: sum(payments.amount) }).from(payments).where(eq(payments.status, "paid"));

  const totalUsers = totalUsersRes?.value || 0;
  const activeEvents = activeEventsRes?.value || 0;
  const totalPhotos = totalPhotosRes?.value || 0;
  const rawRevenue = Number(revenueRes?.value || 0);
  const totalRevenue = `RM ${(rawRevenue / 100).toFixed(2)}`;

  const [totalEventsRes] = await db.select({ value: count() }).from(events);
  const [upgradedEventsRes] = await db.select({ value: count() }).from(events).where(ne(events.plan, "free"));
  const totalEvents = totalEventsRes?.value || 0;
  const upgradedEventsCount = upgradedEventsRes?.value || 0;
  const conversionRate = totalEvents > 0 ? Math.round((upgradedEventsCount / totalEvents) * 100) : 0;

  // 2. Fetch payments from the last 7 days to compile daily revenue trends
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentPayments = await db
    .select({
      amount: payments.amount,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(and(gt(payments.createdAt, sevenDaysAgo), eq(payments.status, "paid")));

  const dailyRevenueMap = new Map<string, number>();
  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
    dailyRevenueMap.set(key, 0);
  }

  recentPayments.forEach((p) => {
    const key = new Date(p.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short" });
    if (dailyRevenueMap.has(key)) {
      dailyRevenueMap.set(key, (dailyRevenueMap.get(key) || 0) + p.amount / 100);
    }
  });

  const chartData = Array.from(dailyRevenueMap.entries()).map(([label, amount]) => ({
    label,
    amount,
  }));

  // Find max amount to scale the SVG chart correctly
  const maxVal = Math.max(...chartData.map(d => d.amount), 50);

  // 3. Query real system activity log stream (scrubbing architecture details)
  const realLogs = await db
    .select({
      id: logs.id,
      action: logs.action,
      details: logs.details,
      createdAt: logs.createdAt,
      userEmail: users.email,
    })
    .from(logs)
    .leftJoin(users, eq(logs.userId, users.id))
    .orderBy(desc(logs.createdAt))
    .limit(4);

  const formattedLogs = realLogs.map((log) => {
    const actionLabel = (log.action || "SYSTEM").toUpperCase();
    const timeString = log.createdAt
      ? new Date(log.createdAt).toLocaleTimeString("en-MY", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      : "00:00:00";
    
    // Scrub internal architecture references for privacy
    let details = log.details || "";
    details = details.replace(/r2:\/\//gi, "storage://");
    details = details.replace(/cloudflare r2/gi, "cloud storage");
    details = details.replace(/neon/gi, "database");

    return {
      time: timeString,
      action: actionLabel,
      details,
      user: log.userEmail || "SYSTEM",
    };
  });

  const bucketName = process.env.R2_BUCKET_NAME || "polaroidku";

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
