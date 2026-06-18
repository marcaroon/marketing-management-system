"use client";

import { useMemo } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProspectChart } from "@/components/dashboard/prospect-chart";
import { MarketingProgress } from "@/components/dashboard/marketing-progress";
import { FollowUpReminder } from "@/components/dashboard/followup-reminder";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PageHeader } from "@/components/shared/page-header";
import { useProspects } from "@/hooks/use-prospects";
import { useClients } from "@/hooks/use-clients";
import { useEvents } from "@/hooks/use-events";
import { useActivities } from "@/hooks/use-activities";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { prospects, isLoading: prospectsLoading } = useProspects();
  const { clients, isLoading: clientsLoading } = useClients();
  const { events, isLoading: eventsLoading } = useEvents();
  const { activities, isLoading: activitiesLoading } = useActivities(10);

  // Scope data based on user role: marketing users see only their own data
  const scopedProspects = useMemo(() => {
    if (isAdmin || !user) return prospects;
    return prospects.filter((p) => p.createdBy === user.uid);
  }, [prospects, isAdmin, user]);

  const scopedEvents = useMemo(() => {
    if (isAdmin || !user) return events;
    return events.filter((e) => e.createdBy === user.uid);
  }, [events, isAdmin, user]);

  // Calculate stats using scoped data
  const totalProspects = scopedProspects.length;
  const totalClients = clients.length;

  const closingThisMonth = scopedProspects.filter((p) => {
    if (p.status !== "closing" || !p.updatedAt) return false;
    const now = new Date();
    const updated = p.updatedAt.toDate();
    return (
      updated.getMonth() === now.getMonth() &&
      updated.getFullYear() === now.getFullYear()
    );
  }).length;

  const upcomingEvents = scopedEvents.filter((e) => {
    if (!e.date) return false;
    return e.date.toDate() >= new Date();
  }).length;

  const isLoading = prospectsLoading || clientsLoading || eventsLoading;

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${getGreeting()}, ${user?.displayName?.split(" ")[0] || "User"}! 👋`}
        description={
          isAdmin
            ? "Berikut ringkasan aktivitas marketing seluruh tim."
            : "Berikut ringkasan aktivitas marketing Anda hari ini."
        }
      />

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
      ) : (
        <StatsCards
          totalProspects={totalProspects}
          totalClients={totalClients}
          closingThisMonth={closingThisMonth}
          upcomingEvents={upcomingEvents}
        />
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <Skeleton className="h-[360px] rounded-xl" />
            <Skeleton className="h-[360px] rounded-xl" />
          </>
        ) : (
          <>
            <MarketingProgress prospects={scopedProspects} />
            <ProspectChart prospects={scopedProspects} />
          </>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <Skeleton className="h-[380px] rounded-xl" />
            <Skeleton className="h-[380px] rounded-xl" />
          </>
        ) : (
          <>
            <FollowUpReminder prospects={scopedProspects} />
            <RecentActivity activities={activities} />
          </>
        )}
      </div>
    </div>
  );
}
