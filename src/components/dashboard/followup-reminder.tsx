"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Prospect } from "@/types";
import { formatTimestamp } from "@/lib/firebase/firestore";
import { Clock, Building2 } from "lucide-react";

interface FollowUpReminderProps {
  prospects: Prospect[];
}

export function FollowUpReminder({ prospects }: FollowUpReminderProps) {
  // Get prospects with follow_up status
  const followUpProspects = prospects
    .filter((p) => p.status === "follow_up")
    .slice(0, 8);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Reminder Follow Up
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {followUpProspects.length} prospek
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {followUpProspects.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center px-6">
              <p className="text-sm text-muted-foreground">
                Tidak ada follow up hari ini
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {followUpProspects.map((prospect) => (
                <div
                  key={prospect.id}
                  className="flex items-start gap-3 border-b border-border/50 px-5 py-3 transition-colors hover:bg-accent/50 last:border-0"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-950/50">
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {prospect.companyName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      PIC: {prospect.picName}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {prospect.ccdName || "N/A"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
