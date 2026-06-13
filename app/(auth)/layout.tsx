import { CameraIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

/* ─── Decorative polaroid card ─────────────────────────────────────────────── */
function PolaroidCard({
  className,
  colorClass,
}: {
  className?: string;
  colorClass: string;
}) {
  return (
    <div
      className={`absolute w-28 rounded-sm bg-white p-2 shadow-2xl ${className}`}
    >
      <div className={`aspect-square w-full rounded-sm ${colorClass}`} />
      <div className="mt-2 h-1 w-2/3 rounded-full bg-slate-200" />
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      {/* ── Left decorative panel (lg+) ─────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[48%] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:28px_28px]" />

        {/* Radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />

        {/* Floating polaroid cards */}
        <PolaroidCard
          className="-rotate-12 top-24 left-16"
          colorClass="bg-gradient-to-br from-rose-300 to-pink-400"
        />
        <PolaroidCard
          className="rotate-6 top-32 right-20"
          colorClass="bg-gradient-to-br from-sky-300 to-blue-400"
        />
        <PolaroidCard
          className="-rotate-3 bottom-36 left-24"
          colorClass="bg-gradient-to-br from-amber-300 to-orange-400"
        />
        <PolaroidCard
          className="rotate-12 bottom-24 right-16"
          colorClass="bg-gradient-to-br from-emerald-300 to-teal-400"
        />
        <PolaroidCard
          className="-rotate-6 top-1/2 -translate-y-1/2 left-8 opacity-50"
          colorClass="bg-gradient-to-br from-violet-300 to-purple-400"
        />

        {/* Branding */}
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/30 text-primary">
              <CameraIcon className="size-6" weight="fill" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              PolaroidKu
            </span>
          </Link>

          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Capture every moment,
            <br />
            <span className="text-primary">share every story</span>
          </h2>
          <p className="max-w-xs text-slate-400 text-base leading-relaxed">
            The digital photo album platform built for event organizers and their guests.
          </p>

          {/* Testimonial chip */}
          <div className="mt-10 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
            <div className="flex -space-x-2">
              {["bg-rose-400", "bg-sky-400", "bg-emerald-400"].map((c, i) => (
                <div
                  key={i}
                  className={`size-7 rounded-full ring-2 ring-slate-900 ${c}`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">2 000+</span> organizers trust us
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 md:px-10">
        {/* Mobile logo (hidden on lg) */}
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 lg:hidden"
        >
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CameraIcon className="size-5" weight="fill" />
          </div>
          <span className="text-xl font-bold">PolaroidKu</span>
        </Link>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
