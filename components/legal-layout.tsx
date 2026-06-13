"use client";

import { Separator } from "@/components/ui/separator";

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}

export default function LegalLayout({
  children,
  title,
  lastUpdated,
}: LegalLayoutProps) {

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-subtle m-6">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            {/* <BrandImage
              src={resolveMarkUrl(settings?.app_logo_url)}
              fallbackSrc={DEFAULT_APP_MARK_URL}
              alt={settings?.app_name || "Logo"}
              width={60}
              height={60}
              className="h-[60px] w-[60px] object-contain pt-3 pb-2"
            /> */}
            <h1 className="mt-3 text-4xl font-bold text-primary">
              {"PolaroidKu"} {title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>

          <Separator className="mb-8" />

          <article>{children}</article>

          <Separator className="mt-10 mb-6" />
          <p className="text-center text-xs text-muted-foreground">
            Questions? Contact us at{" "}
            <a
              href="mailto:support@polaroidku.com"
              className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              support@polaroidku.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
