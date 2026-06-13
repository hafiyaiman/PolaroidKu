"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircleIcon,
  SparkleIcon,
  ArrowRightIcon,
  DownloadSimpleIcon,
  CameraIcon,
  ClockCountdownIcon,
  CreditCardIcon,
  ReceiptIcon,
  ArrowUpRightIcon,
  CoinsIcon,
  ArrowClockwiseIcon,
} from "@phosphor-icons/react";
import { useUpgradeEvent } from "../_hooks/use-billing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BillingEvent {
  id: string;
  name: string;
  date: string;
  status: string;
  plan: "free" | "premium" | "pro";
  photoLimit: number;
  photoCount: number;
  retentionDays: number;
  expiresAt: string | null;
  guestCount: number;
}

interface BillingDashboardProps {
  initialEvents: BillingEvent[];
  initialPurchases: any[];
}

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
    cta: "Upgrade via CHIP",
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
    cta: "Upgrade via CHIP",
    highlight: false,
  },
] as const;

function daysLeft(dateStr: string | null) {
  if (!dateStr) return 0;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function BillingDashboard({ initialEvents, initialPurchases }: BillingDashboardProps) {
  const [eventsList, setEventsList] = React.useState<BillingEvent[]>(initialEvents);
  const [selectedEventId, setSelectedEventId] = React.useState<string>(
    initialEvents[0]?.id || ""
  );
  
  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<"premium" | "pro" | null>(null);
  const [checkoutMethod, setCheckoutMethod] = React.useState<"fpx" | "card" | "ewallet">("fpx");
  const [isPaying, setIsPaying] = React.useState(false);

  const selectedEvent = eventsList.find((e) => e.id === selectedEventId);

  const handleOpenCheckout = (planKey: "premium" | "pro") => {
    if (!selectedEvent) {
      toast.error("Please select or create an event first.");
      return;
    }
    setSelectedPlan(planKey);
    setCheckoutModalOpen(true);
  };

  const { mutateAsync: upgradeEvent } = useUpgradeEvent();

  const handleConfirmPayment = async () => {
    if (!selectedEvent || !selectedPlan) return;

    setIsPaying(true);
    try {
      const res = await upgradeEvent({ eventId: selectedEvent.id, plan: selectedPlan });
      if (res.error) {
        toast.error(res.error);
        setIsPaying(false);
      } else if (res.checkoutUrl) {
        toast.info("Redirecting to payment gateway...");
        window.location.href = res.checkoutUrl;
      } else {
        toast.error("Failed to initialize payment gateway.");
        setIsPaying(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment.");
      setIsPaying(false);
    }
  };

  const handleDownloadInvoice = (purchase: any) => {
    const invoiceContent = `================================================
               POLAROIDKU RECEIPT
================================================
Invoice ID  : ${purchase.id}
Event Name  : ${purchase.eventName}
Event ID    : ${purchase.eventId}
Purchase Dt : ${purchase.date}
Service     : ${purchase.plan}
Amount Paid : ${purchase.price} (MYR)
Payment Mtd : FPX / Credit Card (CHIP Gateway)
Status      : ${purchase.status}

------------------------------------------------
Thank you for choosing PolaroidKu to capture your
special memories!
================================================`;

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt-${purchase.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Invoice download initiated.");
  };

  // Derive active purchases dynamically
  const purchases = React.useMemo(() => {
    return eventsList
      .filter((e) => e.plan !== "free")
      .map((e) => {
        let price = "RM0";
        if (e.plan === "premium") price = "RM29";
        if (e.plan === "pro") price = "RM59";

        return {
          id: `INV-${e.id.substring(0, 8).toUpperCase()}`,
          eventId: e.id,
          eventName: e.name,
          plan: e.plan === "premium" ? "Premium Event" : "Pro Event",
          price,
          date: new Date().toLocaleDateString("en-MY", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          status: "Paid",
        };
      });
  }, [eventsList]);

  // Selected event metrics
  const photoCount = selectedEvent?.photoCount || 0;
  const photoLimit = selectedEvent?.photoLimit || 50;
  const usagePct = Math.min(100, Math.round((photoCount / photoLimit) * 100));
  const daysRemaining = selectedEvent ? daysLeft(selectedEvent.expiresAt) : 0;
  const nearLimit = usagePct >= 80;
  const nearExpiry = daysRemaining <= 7 && daysRemaining > 0;

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 bg-background/30 overflow-y-auto">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Usage-based event upgrades · Pay once, no subscriptions. Powered by <b>CHIP</b>.
          </p>
        </div>
        
        {/* Event selector */}
        {eventsList.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground font-semibold">
              Select Event:
            </label>
            <Select
              value={selectedEventId}
              onValueChange={(val) => setSelectedEventId(val)}
            >
              <SelectTrigger className="text-xs h-9 px-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground font-medium w-48">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
                {eventsList.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} ({e.plan.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {eventsList.length === 0 ? (
        <Card className="border-border/40 bg-card/60 py-12 text-center text-xs text-muted-foreground border-dashed">
          You don't have any events created yet. Go to your dashboard to create one!
        </Card>
      ) : (
        <>
          {/* Selected Event Usage Card */}
          {selectedEvent && (
            <Card className="border-border/40 bg-card/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">
                      {selectedEvent.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Active event usage analysis</p>
                  </div>
                  <Badge
                    className={
                      selectedEvent.plan === "free"
                        ? "bg-muted text-muted-foreground border border-border text-xs"
                        : "bg-primary/15 text-primary border border-primary/20 text-xs font-semibold"
                    }
                  >
                    {selectedEvent.plan.toUpperCase()}
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
                      {photoCount} / {photoLimit}
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
                    {daysRemaining} days (Limit: {selectedEvent.retentionDays} days)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plan comparison */}
          {selectedEvent && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-4">Upgrade Plan for "{selectedEvent.name}"</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {PLANS.map((plan) => {
                  const isCurrent = plan.key === selectedEvent.plan;
                  const canUpgrade = !isCurrent && (
                    selectedEvent.plan === "free" || 
                    (selectedEvent.plan === "premium" && plan.key === "pro")
                  );
                  const isUpgradable = canUpgrade;
                  
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
                          disabled={!isUpgradable}
                          onClick={() => handleOpenCheckout(plan.key as "premium" | "pro")}
                          variant={plan.highlight ? "default" : "outline"}
                          className={`w-full text-xs cursor-pointer active:scale-95 transition-all gap-1.5 ${
                            plan.highlight && isUpgradable ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/15" : ""
                          }`}
                        >
                          {isCurrent ? "Current Plan" : (
                            <>
                              {isUpgradable ? plan.cta : "Downgrade Restricted"}
                              {isUpgradable && <ArrowRightIcon className="size-3" />}
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                Payments processed securely by <b>CHIP</b> · Pay once via FPX, Card, or E-Wallet · No subscription required
              </p>
            </div>
          )}

          <Separator className="opacity-40" />

          {/* Transaction history */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <ReceiptIcon className="size-4" />
              Invoices & Receipts
            </h2>

            {purchases.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground border border-dashed border-border/40 rounded-xl bg-card/20">
                No invoices yet — upgrade an event using CHIP to see billing history here.
              </div>
            ) : (
              <Card className="bg-card/45 border-border/40 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-muted/30 border-b border-border/25">
                    <tr>
                      <th className="p-3 font-semibold">Receipt ID</th>
                      <th className="p-3 font-semibold">Date</th>
                      <th className="p-3 font-semibold">Event</th>
                      <th className="p-3 font-semibold">Plan</th>
                      <th className="p-3 font-semibold text-right">Amount</th>
                      <th className="p-3 font-semibold text-center">Status</th>
                      <th className="p-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((tx) => (
                      <tr key={tx.eventId} className="hover:bg-muted/10 border-b border-border/10 last:border-0">
                        <td className="p-3 font-mono text-foreground">{tx.id}</td>
                        <td className="p-3 text-muted-foreground">{tx.date}</td>
                        <td className="p-3 text-foreground font-semibold">{tx.eventName}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
                            {tx.plan}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-bold text-foreground">{tx.price}</td>
                        <td className="p-3 text-center">
                          <Badge className="bg-green-500/10 text-green-500 border border-green-500/20">{tx.status}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="ghost"
                            onClick={() => handleDownloadInvoice(tx)}
                            className="h-7 px-2 text-[10px] font-semibold text-foreground hover:bg-muted cursor-pointer flex items-center gap-1 mx-auto"
                          >
                            <DownloadSimpleIcon className="size-3" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        </>
      )}

      {/* ─── CHIP PAYMENT GATEWAY SIMULATION MODAL ─────────────────────────── */}
      {checkoutModalOpen && selectedPlan && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-card border border-border/40 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b border-border/30 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center font-bold font-mono text-sm border border-green-500/20">
                    C
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">CHIP Gateway</CardTitle>
                    <p className="text-[10px] text-muted-foreground">Secure Merchant Checkout (Sandbox)</p>
                  </div>
                </div>
                <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-semibold">
                  Test Mode
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 space-y-4 text-xs">
              {/* Order Info */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/30 space-y-2">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Merchant:</span>
                  <span className="font-semibold text-foreground">PolaroidKu Sdn Bhd</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Item:</span>
                  <span className="font-semibold text-foreground">
                    {selectedPlan === "premium" ? "Premium Event Upgrade" : "Pro Event Upgrade"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Target Event:</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {selectedEvent.name}
                  </span>
                </div>
                <Separator className="opacity-20 my-1" />
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Total Charge:</span>
                  <span className="text-green-500 font-extrabold font-mono">
                    {selectedPlan === "premium" ? "RM29.00" : "RM59.00"}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <span className="font-semibold text-foreground block">Select Payment Method:</span>
                
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutMethod("fpx")}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                      checkoutMethod === "fpx"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/30 bg-background/50 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-[10px] bg-muted px-1.5 py-0.5 rounded text-foreground">FPX</span>
                      <span className="font-bold text-foreground">Online Banking</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">TNG, Maybank, CIMB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutMethod("card")}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                      checkoutMethod === "card"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/30 bg-background/50 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="size-4 text-foreground" />
                      <span className="font-bold text-foreground">Credit / Debit Card</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Visa, Mastercard</span>
                  </button>
                </div>
              </div>

              {/* Test Bank warning */}
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-500/90 leading-normal flex items-start gap-1.5">
                <SparkleIcon className="size-3.5 shrink-0 mt-0.5" weight="fill" />
                <span>
                  This checkout is running in <b>Sandbox Test Mode</b>. No actual money will be charged from your selected account.
                </span>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/30 pt-4 flex gap-2">
              <Button
                variant="outline"
                disabled={isPaying}
                onClick={() => setCheckoutModalOpen(false)}
                className="flex-1 text-xs h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                disabled={isPaying}
                onClick={handleConfirmPayment}
                className="flex-1 text-xs h-9 bg-green-600 hover:bg-green-600/90 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-green-600/15"
              >
                {isPaying ? (
                  <>
                    <ArrowClockwiseIcon className="size-3.5 animate-spin" />
                    Authorizing...
                  </>
                ) : (
                  <>
                    Pay Now
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
