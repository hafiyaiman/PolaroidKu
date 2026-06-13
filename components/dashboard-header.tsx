"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
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
import { useCurrentPageTitle } from "@/components/page-title-context";

/**
 * Static label map: maps a path segment to a human-readable label.
 * Dynamic segments (like event IDs) are handled via the PageTitleContext.
 */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  events: "My Events",
  new: "New Event",
  billing: "Billing",
  settings: "Settings",
  admin: "Admin",
  users: "User Directory",
};

interface Crumb {
  label: string;
  href?: string;
}

function buildCrumbs(pathname: string, dynamicTitle: string | null): Crumb[] {
  // Split path and remove empty segments
  const segments = pathname.split("/").filter(Boolean);
  // segments for /dashboard/events/abc123 → ["dashboard", "events", "abc123"]

  const crumbs: Crumb[] = [];
  let accumulated = "";

  segments.forEach((seg, index) => {
    accumulated += `/${seg}`;
    const isLast = index === segments.length - 1;

    // Try static label first
    const staticLabel = SEGMENT_LABELS[seg];

    // If no static label and it's the last segment, it's a dynamic ID segment
    const label = staticLabel ?? (isLast && dynamicTitle ? dynamicTitle : seg);

    if (isLast) {
      crumbs.push({ label });
    } else {
      crumbs.push({ label, href: accumulated });
    }
  });

  return crumbs;
}

export function DashboardHeader() {
  const pathname = usePathname();
  const dynamicTitle = useCurrentPageTitle();
  const crumbs = buildCrumbs(pathname, dynamicTitle);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/40 px-4 bg-background/50 backdrop-blur sticky top-0 z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-full" />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            const isFirst = index === 0;
            return (
              <React.Fragment key={crumb.label + index}>
                <BreadcrumbItem className={!isFirst && !isLast ? "hidden md:block" : undefined}>
                  {isLast ? (
                    <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href ?? "#"}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className={!isFirst ? "hidden md:block" : undefined} />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
