import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CoinsIcon,
  ReceiptIcon,
  CheckCircleIcon,
  PlugsIcon,
  SparkleIcon
} from "@phosphor-icons/react/dist/ssr";

export default function Page() {
  // Mock data for global customer payments ledger
  const globalTransactions = [
    {
      id: "txn_39Dklx",
      user: "Marcus K.",
      email: "marcus.k@live.com",
      plan: "Pro Plan Upgrade",
      amount: "$19.00",
      gateway: "Stripe",
      status: "Successful",
      date: "May 18, 2026",
    },
    {
      id: "txn_38Fjwp",
      user: "Hafiy Aiman",
      email: "hafiyai001@gmail.com",
      plan: "Pro Plan Renewal",
      amount: "$19.00",
      gateway: "Stripe",
      status: "Successful",
      date: "May 12, 2026",
    },
    {
      id: "txn_37Lqrm",
      user: "Emma Carter",
      email: "emma.carter@gmail.com",
      plan: "Pro Plan Upgrade",
      amount: "$19.00",
      gateway: "Stripe",
      status: "Successful",
      date: "April 29, 2026",
    },
    {
      id: "txn_36Kzpt",
      user: "Liam Davis",
      email: "liam.davis@yahoo.com",
      plan: "Pro Plan Upgrade",
      amount: "$19.00",
      gateway: "Stripe",
      status: "Successful",
      date: "April 15, 2026",
    },
  ];

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4 bg-background/50 backdrop-blur">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard/admin">Admin Console</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-pink-500 font-semibold">Billing Control</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Global Billing & Revenue</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Platform-wide sales invoices, Stripe payment settings, and recurring plans.
            </p>
          </div>
          <Badge className="bg-pink-500/10 text-pink-500 border border-pink-500/20 text-xs px-2.5 py-1 flex items-center gap-1.5 font-bold">
            <CoinsIcon className="size-4" />
            Ledger View
          </Badge>
        </div>

        {/* Stripe gateway health card */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-card/65 border-border/40 md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Billing Gateway Configurations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Integration Provider:</span>
                <span className="text-foreground font-bold flex items-center gap-1">
                  <PlugsIcon className="size-4 text-pink-500" />
                  Stripe Dashboard v3
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-green-500/5 border border-green-500/10 flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Webhook Status:</span>
                <Badge className="bg-green-500/15 text-green-500 border border-green-500/20 flex items-center gap-1">
                  <CheckCircleIcon weight="fill" className="size-3.5" />
                  Live & Connected
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/65 border-border/40 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Platform Conversion</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <div className="text-2xl font-extrabold text-foreground">78%</div>
              <Badge className="bg-pink-500/15 text-pink-500 border border-pink-500/20 text-[9px] font-bold">
                <SparkleIcon className="size-3" weight="fill" />
                Active Pro Upgrade Ratio
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Global Customer Ledger */}
        <div className="space-y-3">
          <h2 className="text-md font-semibold text-foreground flex items-center gap-1.5">
            <ReceiptIcon className="size-4" />
            Global Ledger Logs
          </h2>
          <Card className="bg-card/45 border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Transaction ID</TableHead>
                  <TableHead className="text-xs font-semibold">Customer</TableHead>
                  <TableHead className="text-xs font-semibold">Description</TableHead>
                  <TableHead className="text-xs font-semibold">Stripe Charged</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Gateway Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Processed On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {globalTransactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-muted/10">
                    <TableCell className="font-mono text-xs font-medium text-foreground">{tx.id}</TableCell>
                    <TableCell className="space-y-0.5">
                      <p className="font-semibold text-foreground text-xs">{tx.user}</p>
                      <span className="text-muted-foreground text-[10px] block">{tx.email}</span>
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium">{tx.plan}</TableCell>
                    <TableCell className="text-xs text-foreground font-semibold">{tx.amount}</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/15">
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground">{tx.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </>
  );
}
