"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCardIcon, DownloadSimpleIcon } from "@phosphor-icons/react";

interface BillingSettingsProps {
  initialPurchases: any[];
}

export function BillingSettings({ initialPurchases }: BillingSettingsProps) {
  const [paymentMethod, setPaymentMethod] = React.useState<"card" | "fpx">("card");
  const [purchases] = React.useState<any[]>(initialPurchases);

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
Payment Mtd : FPX / Credit Card (Online)
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

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <Card className="bg-card/45 border-border/40">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-sm font-bold text-foreground">Payment Method</CardTitle>
          <CardDescription className="text-xs">
            Choose your default online payment method (processed securely via CHIP).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                paymentMethod === "card"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border/40 bg-background/40 hover:bg-muted/30"
              }`}
            >
              <div className="p-2 rounded bg-muted">
                <CreditCardIcon className="size-5 text-foreground" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">Credit / Debit Card</p>
                <span className="text-muted-foreground block mt-0.5">Visa, Mastercard, AMEX</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("fpx")}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                paymentMethod === "fpx"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border/40 bg-background/40 hover:bg-muted/30"
              }`}
            >
              <div className="p-2 rounded bg-muted text-foreground text-xs font-bold font-mono">
                FPX
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">FPX Online Banking</p>
                <span className="text-muted-foreground block mt-0.5">TNG eWallet, Maybank2u, CIMB Click</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Event Purchases & Billing History */}
      <Card className="bg-card/45 border-border/40">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-sm font-bold text-foreground">Event Purchases & Invoices</CardTitle>
          <CardDescription className="text-xs">
            One-time payments upgraded for your guestbook events.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {purchases.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border/45 rounded-xl bg-muted/10">
              No active event purchases. Upgrade an event in the Billing tab to generate invoices.
            </div>
          ) : (
            <div className="overflow-x-auto border border-border/25 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/20">
                    <th className="p-3 font-semibold text-muted-foreground">Invoice ID</th>
                    <th className="p-3 font-semibold text-muted-foreground">Date</th>
                    <th className="p-3 font-semibold text-muted-foreground">Event name</th>
                    <th className="p-3 font-semibold text-muted-foreground">Plan</th>
                    <th className="p-3 font-semibold text-muted-foreground text-right">Price</th>
                    <th className="p-3 font-semibold text-muted-foreground text-center">Status</th>
                    <th className="p-3 font-semibold text-muted-foreground text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {purchases.map((purchase) => (
                    <tr key={purchase.eventId} className="hover:bg-muted/10">
                      <td className="p-3 font-mono font-medium text-foreground">{purchase.id}</td>
                      <td className="p-3 text-muted-foreground">{purchase.date}</td>
                      <td className="p-3 text-foreground font-semibold">{purchase.eventName}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
                          {purchase.plan}
                        </Badge>
                      </td>
                      <td className="p-3 text-right text-foreground font-bold">{purchase.price}</td>
                      <td className="p-3 text-center">
                        <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px]">
                          {purchase.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          onClick={() => handleDownloadInvoice(purchase)}
                          className="h-7 px-2 text-[10px] font-bold text-foreground hover:bg-muted cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <DownloadSimpleIcon className="size-3" />
                          Invoice
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
