"use client";

import {
  UserSearch,
  Building2,
  TrendingUp,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: string;
  bgColor: string;
}

interface StatsCardsProps {
  totalProspects: number;
  totalClients: number;
  closingThisMonth: number;
  upcomingEvents: number;
}

export function StatsCards({
  totalProspects,
  totalClients,
  closingThisMonth,
  upcomingEvents,
}: StatsCardsProps) {
  const stats: StatCard[] = [
    {
      title: "Total Prospek",
      value: totalProspects,
      description: "Semua prospek terdaftar",
      icon: UserSearch,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Klien Aktif",
      value: totalClients,
      description: "Klien dengan layanan aktif",
      icon: Building2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Closing Bulan Ini",
      value: closingThisMonth,
      description: "Prospek berhasil closing",
      icon: TrendingUp,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-950/50",
    },
    {
      title: "Event Terdekat",
      value: upcomingEvents,
      description: "Event yang akan datang",
      icon: CalendarCheck,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="group relative overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-md hover:shadow-black/5"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                  stat.bgColor
                )}
              >
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
