import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircleIcon,
  LockSimpleIcon,
  ReceiptIcon,
  SparkleIcon,
  ArrowRightIcon,
  FilePdfIcon,
  CloudArrowUpIcon,
  CameraIcon,
  ClockCountdownIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";

// ─── Mock data ── replace with real DB query ──────────────────────────────────
const currentPlan = "free" as "free" | "premium" | "pro";

const mockEventUsage = {
  eventName: "Sarah & David's Wedding",
  photoCount: 34,
  photoLimit: 50,
  retentionDays: 30,
  expiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
};

const transactions: any[] = [
  // empty = no invoices yet on free plan
];
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: null,
    priceLabel: "RM0",
    photos: "50 photos",
    retention: "30 days",
    features: ["50 photo uploads", "30-day gallery access", "Basic QR code", "PolaroidKu watermark"],
    cta: "Current Plan",
    highlight: false,
  },
  {
    key: "premium",
    name: "Premium",
    price: 29,
    priceLabel: "RM29",
    photos: "1,000 photos",
    retention: "90 days",
    features: ["1,000 photo uploads", "90-day gallery access", "No watermark", "ZIP download", "PDF guestbook export"],
    cta: "Upgrade to Premium",
    highlight: true,
  },
  {
    key: "pro",
    name: "Pro",
    price: 59,
    priceLabel: "RM59",
    photos: "3,000 photos",
    retention: "180 days",
    features: ["3,000 photo uploads", "180-day gallery access", "Custom branding", "Slideshow mode", "Priority support"],
    cta: "Upgrade to Pro",
    highlight: false,
  },
] as const;

function daysLeft(date: Date) {
  const diff = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function Page() {
  const usagePct = Math.round((mockEventUsage.photoCount / mockEventUsage.photoLimit) * 100);
  const daysRemaining = daysLeft(mockEventUsage.expiresAt);
  const nearLimit = usagePct >= 80;
  const nearExpiry = daysRemaining <= 7;

  return (
    <>
      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 bg-background/30 overflow-y-auto">

        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Usage-based plans · Pay once per event, no subscription.
          </p>
        </div>

        {/* Event usage card */}
        <Card className="border-border/40 bg-card/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">{mockEventUsage.eventName}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Active event usage</p>
              </div>
              <Badge
                className={
                  currentPlan === "free"
                    ? "bg-muted text-muted-foreground border border-border text-xs"
                    : "bg-primary/15 text-primary border border-primary/20 text-xs"
                }
              >
                {currentPlan === "free" ? "Free" : currentPlan === "premium" ? "Premium" : "Pro"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photo upload usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <CameraIcon className="size-3.5" />
                  Photo uploads
                </span>
                <span className={`font-semibold ${nearLimit ? "text-destructive" : "text-foreground"}`}>
                  {mockEventUsage.photoCount} / {mockEventUsage.photoLimit}
                </span>
              </div>
              <Progress
                value={usagePct}
                className={`h-2 ${nearLimit ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
              />
              {nearLimit && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                  <SparkleIcon className="size-3" weight="fill" />
                  Your event is approaching the upload limit — upgrade to keep collecting memories.
                </p>
              )}
            </div>

            {/* Retention */}
            <div className="flex items-center justify-between text-xs py-2 border-t border-border/30">
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <ClockCountdownIcon className="size-3.5" />
                Gallery expires in
              </span>
              <span className={`font-semibold ${nearExpiry ? "text-destructive" : "text-foreground"}`}>
                {daysRemaining} days
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Plan comparison */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4">Upgrade Plan</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => {
              const isCurrent = plan.key === currentPlan;
              return (
                <Card
                  key={plan.key}
                  className={`flex flex-col transition-all ${
                    plan.highlight
                      ? "border-primary/35 ring-1 ring-primary/15 shadow-md shadow-primary/5"
                      : "border-border/40 bg-card/45"
                  }`}
                >
                  {plan.highlight && (
                    <div className="h-0.5 bg-gradient-to-r from-primary via-primary/70 to-primary/40 rounded-t-xl" />
                  )}
                  <CardHeader className="pb-3 pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{plan.name}</span>
                      {plan.highlight && (
                        <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-extrabold text-foreground">{plan.priceLabel}</span>
                      {plan.price && <span className="text-xs text-muted-foreground mb-0.5">/ event</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CameraIcon className="size-3" />{plan.photos}</span>
                      <span className="flex items-center gap-1"><ClockCountdownIcon className="size-3" />{plan.retention}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-xs flex-1 pb-4">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-foreground">
                        <CheckCircleIcon weight="fill" className={`size-3.5 shrink-0 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                        {f}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="pt-3 border-t border-border/30">
                    <Button
                      disabled={isCurrent}
                      variant={plan.highlight ? "default" : "outline"}
                      className={`w-full text-xs cursor-pointer active:scale-95 transition-all gap-1.5 ${
                        plan.highlight ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/15" : ""
                      }`}
                    >
                      {isCurrent ? "Current Plan" : (
                        <>
                          {plan.cta}
                          <ArrowRightIcon className="size-3" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 text-center">
            Plans apply per event · Pay via TNG eWallet, FPX, or Credit Card · No recurring charges
          </p>
        </div>

        <Separator className="opacity-40" />

        {/* Transaction history */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ReceiptIcon className="size-4" />
            Invoices
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground border border-dashed border-border/40 rounded-xl bg-card/20">
              No invoices yet — upgrade an event to see billing history here.
            </div>
          ) : (
            <Card className="bg-card/45 border-border/40 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Receipt ID</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold">Event</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(transactions as any[]).map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/10">
                      <TableCell className="font-mono text-xs text-foreground">{tx.id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tx.date}</TableCell>
                      <TableCell className="text-xs text-foreground font-medium">{tx.event}</TableCell>
                      <TableCell className="text-xs text-right font-semibold text-foreground">{tx.amount}</TableCell>
                      <TableCell className="text-xs text-right">
                        <Badge className="bg-primary/10 text-primary border border-primary/20">{tx.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>

      </div>
    </>
  );
}
