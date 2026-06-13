import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Receipt, Camera, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Successful — PolaroidKu",
  description: "Your event has been successfully upgraded.",
};

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    event_name?: string;
    plan?: string;
    photo_limit?: string;
    retention_days?: string;
    receipt_id?: string;
  }>;
}) {
  const { event_name, plan, photo_limit, retention_days, receipt_id } = await searchParams;

  const planLabel = plan === "pro" ? "Pro" : "Premium";
  const planColor = plan === "pro" ? "#a78bfa" : "#60a5fa";

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "radial-gradient(ellipse at 60% 0%, #0f1117 0%, #060608 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Subtle grid */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "rgba(34,197,94,0.08)",
            border: "1.5px solid rgba(34,197,94,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <CheckCircle size={44} color="#22c55e" strokeWidth={1.5} />
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#f8fafc",
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            Payment Successful
          </h1>
          {event_name && (
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
              <strong style={{ color: "#e2e8f0" }}>&ldquo;{event_name}&rdquo;</strong> has been upgraded to{" "}
              <strong style={{ color: planColor }}>{planLabel}</strong>
            </p>
          )}
        </div>

        {/* Receipt card */}
        <div
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1rem",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#64748b",
              margin: 0,
              fontWeight: 600,
            }}
          >
            Receipt Summary
          </p>

          {[
            {
              icon: <Receipt size={13} color="#94a3b8" />,
              label: "Receipt ID",
              value: receipt_id ? receipt_id.slice(0, 18) + "…" : "—",
              mono: true,
            },
            {
              icon: <Camera size={13} color="#94a3b8" />,
              label: "Photo Limit",
              value: photo_limit ? `${Number(photo_limit).toLocaleString()} photos` : "—",
            },
            {
              icon: <Clock size={13} color="#94a3b8" />,
              label: "Retention",
              value: retention_days ? `${retention_days} days` : "—",
            },
          ].map(({ icon, label, value, mono }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.8125rem",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  color: "#94a3b8",
                }}
              >
                {icon}
                {label}
              </span>
              <span
                style={{
                  color: "#e2e8f0",
                  fontWeight: 600,
                  fontFamily: mono ? "monospace" : "inherit",
                  fontSize: mono ? "0.75rem" : "inherit",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/dashboard/billing"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.625rem",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            letterSpacing: "-0.01em",
            boxShadow: "0 0 24px rgba(99,102,241,0.25)",
            transition: "opacity 0.15s",
          }}
        >
          Go to Dashboard
          <ArrowRight size={15} />
        </Link>

        <p style={{ color: "#475569", fontSize: "0.75rem", textAlign: "center", margin: 0 }}>
          Powered by{" "}
          <a
            href="https://chip-in.asia"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#64748b", textDecoration: "underline" }}
          >
            CHIP Gateway
          </a>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        @keyframes pop {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
