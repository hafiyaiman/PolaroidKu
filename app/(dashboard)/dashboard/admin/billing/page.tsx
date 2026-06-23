"use client";

import { useAdminBilling } from "../_hooks/use-admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CoinsIcon, ReceiptIcon, CheckCircleIcon, PlugsIcon, SparkleIcon, LockKeyIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function Page() {
  const { data: billingData, isLoading, error } = useAdminBilling();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background/30">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-pink-500" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Loading ledger logs...</p>
        </div>
      </div>
    );
  }

  if (error || !billingData) {
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
              You do not have the required permissions to view the global billing ledger. Access is restricted to Super Administrators only.
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

  const { realTransactions, totalEvents, upgradedEventsCount, conversionRate } = billingData;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background/30 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Global Billing & Revenue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform-wide sales invoices, CHIP gateway integration settings, and active plans.
          </p>
        </div>
        <Badge className="bg-pink-500/10 text-pink-500 border border-pink-500/20 text-xs px-2.5 py-1 flex items-center gap-1.5 font-bold">
          <CoinsIcon className="size-4" />
          Ledger View
        </Badge>
      </div>

      {/* CHIP gateway health card */}
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
                CHIP Gateway API v1
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-green-500/5 border border-green-500/10 flex justify-between items-center">
              <span className="text-muted-foreground font-semibold">Gateway Status:</span>
              <Badge className="bg-green-500/15 text-green-500 border border-green-500/20 flex items-center gap-1">
                <CheckCircleIcon weight="fill" className="size-3.5" />
                Active & Connected
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/65 border-border/40 flex flex-col justify-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Platform Conversion</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className="text-2xl font-extrabold text-foreground">{conversionRate}%</div>
            <Badge className="bg-pink-500/15 text-pink-500 border border-pink-500/20 text-[9px] font-bold">
              <SparkleIcon className="size-3" weight="fill" />
              Active Upgrade Ratio ({upgradedEventsCount}/{totalEvents})
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
          {realTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No upgrade transactions recorded on the platform yet.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Transaction / Ref ID</TableHead>
                  <TableHead className="text-xs font-semibold">Customer</TableHead>
                  <TableHead className="text-xs font-semibold">Description</TableHead>
                  <TableHead className="text-xs font-semibold">Charged</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Gateway Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Processed On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {realTransactions.map((tx) => {
                  const price = `RM ${(tx.amount / 100).toFixed(2)}`;
                  const displayId = tx.id.startsWith("pur_") ? tx.id.substring(4, 12).toUpperCase() : tx.id.substring(0, 8).toUpperCase();
                  return (
                    <TableRow key={tx.id} className="hover:bg-muted/10">
                      <TableCell className="font-mono text-xs font-medium text-foreground">
                        {displayId}
                      </TableCell>
                      <TableCell className="space-y-0.5">
                        <p className="font-semibold text-foreground text-xs">{tx.userName || "Customer"}</p>
                        <span className="text-muted-foreground text-[10px] block">{tx.userEmail}</span>
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-medium">
                        {tx.plan === "pro" ? "Pro Plan Upgrade" : "Premium Plan Upgrade"} ({tx.eventName})
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-semibold">{price}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={
                          tx.status === "paid"
                            ? "bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/15"
                            : tx.status === "pending"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
