import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon, CalendarIcon, CloudArrowUpIcon, CoinsIcon } from "@phosphor-icons/react/dist/ssr";

interface AdminStatsProps {
  totalUsers: number;
  activeEvents: number;
  totalPhotos: number;
  totalRevenue: string;
  conversionRate: number;
}

export function AdminStats({
  totalUsers,
  activeEvents,
  totalPhotos,
  totalRevenue,
  conversionRate,
}: AdminStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card/65 border-border/40 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Platform Users</CardTitle>
          <div className="p-2 bg-muted/40 rounded-lg">
            <UsersIcon className="size-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">{totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Active user accounts</p>
        </CardContent>
      </Card>

      <Card className="bg-card/65 border-border/40 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Guestbooks</CardTitle>
          <div className="p-2 bg-muted/40 rounded-lg">
            <CalendarIcon className="size-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">{activeEvents.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Live capture feeds</p>
        </CardContent>
      </Card>

      <Card className="bg-card/65 border-border/40 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Photos Collected</CardTitle>
          <div className="p-2 bg-muted/40 rounded-lg">
            <CloudArrowUpIcon className="size-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">{totalPhotos.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Secure cloud image assets</p>
        </CardContent>
      </Card>

      <Card className="bg-card/65 border-border/40 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Gross Revenue</CardTitle>
          <div className="p-2 bg-muted/40 rounded-lg">
            <CoinsIcon className="size-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">{totalRevenue}</div>
          <p className="text-xs text-emerald-500 mt-1 font-semibold">{conversionRate}% event upgrade rate</p>
        </CardContent>
      </Card>
    </div>
  );
}
