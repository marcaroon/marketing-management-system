"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useProspects } from "@/hooks/use-prospects";
import { useEvents } from "@/hooks/use-events";
import { useClients } from "@/hooks/use-clients";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic import FullCalendar (client-only)
const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

export default function CalendarPage() {
  const { prospects, isLoading: pLoading } = useProspects();
  const { events, isLoading: eLoading } = useEvents();
  const { clients, isLoading: cLoading } = useClients();

  const calendarEvents = useMemo(() => {
    const items: any[] = [];

    // Events (BG/BV)
    events.forEach((e) => {
      if (e.date) {
        items.push({
          id: `event-${e.id}`,
          title: `📅 ${e.title}`,
          start: e.date.toDate(),
          end: e.endDate?.toDate(),
          backgroundColor: e.type === "business_gathering" ? "#3b82f6" : "#8b5cf6",
          borderColor: e.type === "business_gathering" ? "#3b82f6" : "#8b5cf6",
          url: `/events/${e.id}`,
        });
      }
    });

    // Follow ups
    prospects.forEach((p) => {
      [p.followUp1, p.followUp2, p.followUp3].forEach((fu, i) => {
        if (fu?.date) {
          items.push({
            id: `fu-${p.id}-${i}`,
            title: `📞 FU${i + 1}: ${p.companyName}`,
            start: fu.date.toDate(),
            backgroundColor: "#f59e0b",
            borderColor: "#f59e0b",
            url: `/prospects/${p.id}`,
          });
        }
      });

      // Meetings
      if (p.status === "meeting" && p.updatedAt) {
        items.push({
          id: `meeting-${p.id}`,
          title: `🤝 Meeting: ${p.companyName}`,
          start: p.updatedAt.toDate(),
          backgroundColor: "#10b981",
          borderColor: "#10b981",
          url: `/prospects/${p.id}`,
        });
      }
    });

    // Client deadlines
    clients.forEach((c) => {
      if (c.projectDeadline) {
        items.push({
          id: `deadline-${c.id}`,
          title: `⏰ Deadline: ${c.companyName}`,
          start: c.projectDeadline.toDate(),
          backgroundColor: "#ef4444",
          borderColor: "#ef4444",
          url: `/clients/${c.id}`,
        });
      }
    });

    return items;
  }, [events, prospects, clients]);

  const isLoading = pLoading || eLoading || cLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalender"
        description="Jadwal event, follow up, meeting, dan deadline"
      />
      <Card className="border-border/50">
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <Skeleton className="h-[600px] w-full rounded-lg" />
          ) : (
            <div className="calendar-wrapper">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,listWeek",
                }}
                locale="id"
                events={calendarEvents}
                eventClick={(info) => {
                  info.jsEvent.preventDefault();
                  if (info.event.url) {
                    window.location.href = info.event.url;
                  }
                }}
                height="auto"
                dayMaxEvents={3}
                nowIndicator
                editable={false}
                buttonText={{
                  today: "Hari Ini",
                  month: "Bulan",
                  list: "Daftar",
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
