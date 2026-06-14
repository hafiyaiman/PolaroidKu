import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CameraIcon,
  CloudArrowUpIcon,
  PlusIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from "@phosphor-icons/react/dist/ssr";

import { getDashboardStats, getRecentSubmissions } from "@/app/actions/event-actions";

export default async function Page() {
  const dbStats = await getDashboardStats();
  const recentSubmissions = await getRecentSubmissions();

  // Dynamic database statistics
  const stats = [
    {
      title: "Total Guestbooks",
      value: dbStats.totalEvents.toString(),
      description: "Active digital polaroid events",
      icon: <CalendarIcon className="size-5 text-primary" />,
    },
    {
      title: "Guest Submissions",
      value: dbStats.totalWishes.toString(),
      description: "Polaroid photos + wishes received",
      icon: <CameraIcon className="size-5 text-primary" />,
    },
    {
      title: "Secure Storage Space",
      value: dbStats.storageUsed,
      description: "Total space utilized by uploads",
      icon: <CloudArrowUpIcon className="size-5 text-primary" />,
    },
    {
      title: "Active Tier",
      value: dbStats.activeTier,
      description: "Unlimited events & custom subdomains",
      icon: <ShieldCheckIcon className="size-5 text-primary" />,
    },
  ];


  return (
    <>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 overflow-y-auto">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/15">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back!</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your digital polaroid guestbooks are active and securing memories.
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer shadow-lg shadow-primary/20 active:scale-95 transition-all">
            <Link href="/dashboard/events/new" className="flex items-center gap-1.5">
              <PlusIcon weight="bold" className="size-4" />
              New Guestbook Event
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-card/45 border-border/40 hover:border-primary/25 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="p-2 bg-muted/40 rounded-lg">{stat.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</div>
                <CardDescription className="text-xs text-muted-foreground mt-1">{stat.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Submissions Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Recent Guestbook Sign-ins
            </h2>
            <Button variant="ghost" asChild className="text-xs text-primary hover:text-primary/80 cursor-pointer">
              <Link href="/dashboard/events" className="flex items-center gap-1">
                View All Events
                <ArrowRightIcon className="size-3" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {recentSubmissions.length === 0 ? (
              <div className="col-span-3 py-12 px-4 text-center text-xs text-muted-foreground bg-card/25 border border-dashed border-border/40 rounded-xl">
                No memories captured yet. Print your event QR code to get started!
              </div>
            ) : (
              recentSubmissions.map((sub) => (
                <Card key={sub.id} className="overflow-hidden bg-card/65 border-border/40 hover:shadow-lg transition-all group">
                  <div className="p-4 bg-muted/20 pb-0 flex flex-col items-center">
                    {/* Polaroid Frame Container */}
                    <div className="bg-white p-3 pb-8 shadow-md rounded border border-neutral-100 flex flex-col items-center w-full max-w-[240px] transform hover:rotate-1 hover:scale-[1.02] transition-transform">
                      {/* Photo */}
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 border border-neutral-200">
                        <img
                          src={sub.imageUrl}
                          alt={sub.guestName}
                          className="object-cover w-full h-full filter sepia-[0.1] contrast-[1.05]"
                        />
                      </div>
                      {/* Handwritten-style caption inside the polaroid */}
                      <div className="mt-4 text-center font-serif text-neutral-800 text-xs tracking-tight truncate w-full">
                        💌 {sub.guestName}
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-primary">{sub.eventName}</span>
                      <span className="text-muted-foreground">{sub.time}</span>
                    </div>
                    <p className="text-sm text-foreground/80 italic font-serif bg-muted/30 p-3 rounded-lg border border-border/30 line-clamp-3">
                      "{sub.wish}"
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
