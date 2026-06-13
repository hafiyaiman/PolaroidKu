import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UsersIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  CoinsIcon,
  ArrowRightIcon,
  LockKeyIcon,
  TerminalIcon
} from "@phosphor-icons/react/dist/ssr";

export default function Page() {
  const globalStats = [
    {
      title: "Total Platform Users",
      value: "1,248",
      change: "+12% this week",
      icon: <UsersIcon className="size-5 text-primary" />,
    },
    {
      title: "Active Guestbooks",
      value: "3,842",
      change: "+8% this week",
      icon: <CalendarIcon className="size-5 text-primary" />,
    },
    {
      title: "Photos Stored (R2)",
      value: "84,912",
      change: "+15 GB bandwidth",
      icon: <CloudArrowUpIcon className="size-5 text-primary" />,
    },
    {
      title: "Monthly Revenue (MRR)",
      value: "$14,820",
      change: "+18% vs last month",
      icon: <CoinsIcon className="size-5 text-primary" />,
    },
  ];

  const r2Regions = [
    { region: "APAC (Singapore)", buckets: "2,105", space: "482 GB", status: "Healthy" },
    { region: "ENAM (N. Virginia)", buckets: "1,240", space: "320 GB", status: "Healthy" },
    { region: "WEUR (Frankfurt)", buckets: "497", space: "98 GB", status: "Healthy" },
  ];

  const recentLogs = [
    { time: "14:35:10", action: "BUCKET_CREATED", details: "r2://polaroidku-event-sarah-david (APAC)", user: "hafiyai001@gmail.com" },
    { time: "14:34:02", action: "USER_SIGNUP", details: "New registration completed via email verification", user: "guest-392@gmail.com" },
    { time: "14:28:45", action: "SUBSCRIPTION_UPGRADED", details: "Pro Plan purchased - Transaction ref: txn_39Dklx", user: "marcus.k@live.com" },
    { time: "14:15:22", action: "CF_R2_TOKEN_SYNC", details: "Assigned secure R2 API Token credentials to polaroidku-event-sarah-david", user: "SYSTEM" },
  ];

  return (
    <>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Super Admin Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Global dashboard analytics, secure storage metrics, and real-time logs.
            </p>
          </div>
          <Badge className="bg-primary/15 text-primary border border-primary/20 font-bold px-3 py-1">
            Platform Master Mode
          </Badge>
        </div>

        {/* Global stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {globalStats.map((stat) => (
            <Card key={stat.title} className="bg-card/65 border-border/40 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="p-2 bg-muted/40 rounded-lg">{stat.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</div>
                <p className="text-xs text-emerald-500 mt-1 font-medium">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Cloudflare R2 Global Storage Distribution */}
          <Card className="bg-card/65 border-border/40 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <LockKeyIcon className="size-4.5 text-indigo-400" />
                Cloudflare R2 Object Storage
              </CardTitle>
              <CardDescription>
                Summary of active isolated R2 buckets and R2 space consumed globally.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {r2Regions.map((r) => (
                <div key={r.region} className="flex justify-between items-center py-2 border-b border-border/20 text-xs last:border-b-0">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{r.region}</p>
                    <span className="text-muted-foreground text-[10px]">{r.buckets} secure R2 buckets</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{r.space}</p>
                    <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] px-1 py-0 h-4">
                      {r.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Realtime System Action logs */}
          <Card className="bg-card/65 border-border/40 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <TerminalIcon className="size-4.5 text-pink-500" />
                Recent System Log Stream
              </CardTitle>
              <CardDescription>
                Real-time activity logs for Cloudflare R2 bucket provisioning and subscriptions.
              </CardDescription>
            </CardHeader>
            <CardContent className="font-mono text-[10px] space-y-3 flex-1">
              {recentLogs.map((log, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-muted/20 border border-border/40 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-pink-500">{log.action}</span>
                    <span className="text-muted-foreground">{log.time}</span>
                  </div>
                  <p className="text-foreground/80 leading-normal">{log.details}</p>
                  <span className="text-muted-foreground/60 text-[9px]">Triggered by: {log.user}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

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
    </>
  );
}
