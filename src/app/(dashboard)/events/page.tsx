"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { formatTimestamp } from "@/lib/firebase/firestore";
import { EVENT_TYPE_OPTIONS } from "@/lib/constants";
import { MarketingEvent } from "@/types";
import { Plus, MapPin, Calendar, Users, Eye, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EventsPage() {
  const { events, isLoading, removeEvent } = useEvents();
  const { isAdmin, canManageEvent } = useAuth();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      await removeEvent(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Event Marketing" description="Kelola Business Gathering dan Business Visit">
        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-800">
          <Link href="/events/new"><Plus className="mr-2 h-4 w-4" />Buat Event</Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[200px] animate-pulse bg-muted" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Belum ada event.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} canManage={canManageEvent(event.createdBy)} onDelete={() => setDeleteId(event.id)} />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Event?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EventCard({ event, canManage, onDelete }: { event: MarketingEvent; canManage: boolean; onDelete: () => void }) {
  const typeLabel = EVENT_TYPE_OPTIONS.find((o) => o.value === event.type)?.label || event.type;
  const isUpcoming = event.date && event.date.toDate() >= new Date();

  return (
    <Card className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-md">
      <div className={`absolute left-0 top-0 h-1 w-full ${event.type === "business_gathering" ? "bg-blue-500" : "bg-violet-500"}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant={isUpcoming ? "default" : "secondary"} className="mb-2 text-[10px]">
              {typeLabel}
            </Badge>
            <CardTitle className="text-base">{event.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatTimestamp(event.date)}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {event.location || "Belum ditentukan"}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {event.participantCount || 0} peserta ({event.attendedCount || 0} hadir)
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/events/${event.id}`}><Eye className="mr-1 h-3.5 w-3.5" />Detail</Link>
          </Button>
          {canManage && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
