import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CalendarIcon,
  CameraIcon,
  UsersIcon,
  HourglassIcon,
} from "@phosphor-icons/react/dist/ssr";

interface StatsCardsProps {
  stats: {
    totalEvents: number;
    totalWishes: number;
    totalContributors: number;
    expiringSoon: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      description: "Active and legacy digital guestbooks",
      icon: <CalendarIcon className="size-5 text-primary" weight="duotone" />,
    },
    {
      title: "Total Memories",
      value: stats.totalWishes,
      description: "Captured polaroid photos and wishes",
      icon: <CameraIcon className="size-5 text-emerald-500" weight="duotone" />,
    },
    {
      title: "Total Contributors",
      value: stats.totalContributors,
      description: "Unique guests who signed in",
      icon: <UsersIcon className="size-5 text-blue-500" weight="duotone" />,
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSoon,
      description: "Events expiring in next 7 days",
      icon: <HourglassIcon className="size-5 text-amber-500" weight="duotone" />,
      highlight: stats.expiringSoon > 0,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`bg-card/45 border-border/40 hover:border-primary/25 hover:shadow-md transition-all ${
            card.highlight ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50" : ""
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className="p-2 bg-muted/40 rounded-lg">{card.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {card.value.toLocaleString()}
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              {card.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
