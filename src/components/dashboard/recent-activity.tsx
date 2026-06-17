"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "@/types";
import { formatTimestamp } from "@/lib/firebase/firestore";
import {
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actionIcons: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  created_prospect: {
    icon: UserPlus,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
  },
  updated_prospect: {
    icon: Edit,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
  },
  deleted_prospect: {
    icon: Trash2,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/50",
  },
  status_changed: {
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  created_event: {
    icon: Calendar,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/50",
  },
};

const defaultAction = {
  icon: Edit,
  color: "text-gray-600 dark:text-gray-400",
  bg: "bg-gray-50 dark:bg-gray-950/50",
};

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {activities.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center px-6">
              <p className="text-sm text-muted-foreground">
                Belum ada aktivitas
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {activities.map((activity) => {
                const actionStyle = actionIcons[activity.action] || defaultAction;
                const Icon = actionStyle.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-b border-border/50 px-5 py-3 last:border-0"
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        actionStyle.bg
                      )}
                    >
                      <Icon className={cn("h-4 w-4", actionStyle.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.userName}</span>{" "}
                        <span className="text-muted-foreground">
                          {activity.description}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {activity.createdAt
                          ? formatTimestamp(activity.createdAt, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Baru saja"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
