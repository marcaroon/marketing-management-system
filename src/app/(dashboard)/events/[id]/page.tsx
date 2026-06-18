"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { useEvents } from "@/hooks/use-events";
import { useEventParticipants } from "@/hooks/use-event-participants";
import { useAuth } from "@/hooks/use-auth";
import { formatTimestamp } from "@/lib/firebase/firestore";
import { EVENT_TYPE_OPTIONS, PARTICIPANT_ATTENDANCE_OPTIONS, PARTICIPANT_ATTENDANCE_LABELS } from "@/lib/constants";
import { MarketingEvent, ParticipantAttendance } from "@/types";
import { ArrowLeft, MapPin, Calendar, Users, Plus, Trash2, Edit } from "lucide-react";
import { ParticipantForm } from "@/components/events/participant-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const { getEvent } = useEvents();
  const { canManageEvent } = useAuth();
  const { participants, isLoading: isLoadingParticipants, fetchParticipants, updateParticipantStatus, removeParticipant } = useEventParticipants(eventId);
  
  const [event, setEvent] = useState<MarketingEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteParticipant, setDeleteParticipant] = useState<{ id: string; status: ParticipantAttendance } | null>(null);
  const [isDeletingParticipant, setIsDeletingParticipant] = useState(false);

  const loadEvent = useCallback(async () => {
    if (eventId) {
      const data = await getEvent(eventId);
      setEvent(data);
      setIsLoading(false);
    }
  }, [eventId, getEvent]);

  useEffect(() => {
    loadEvent();
    fetchParticipants();
  }, [loadEvent, fetchParticipants]);

  const handleParticipantAdded = () => {
    loadEvent(); // Refresh event stats
  };

  const handleStatusChange = async (participantId: string, oldStatus: ParticipantAttendance, newStatus: ParticipantAttendance) => {
    await updateParticipantStatus(participantId, oldStatus, newStatus);
    loadEvent(); // Refresh event stats
  };

  const handleConfirmDeleteParticipant = async () => {
    if (!deleteParticipant) return;
    setIsDeletingParticipant(true);
    try {
      await removeParticipant(deleteParticipant.id, deleteParticipant.status);
      loadEvent(); // Refresh event stats
    } finally {
      setIsDeletingParticipant(false);
      setDeleteParticipant(null);
    }
  };

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-[400px]" /></div>;

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium">Event tidak ditemukan</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  const typeLabel = EVENT_TYPE_OPTIONS.find((o) => o.value === event.type)?.label;
  const canManage = canManageEvent(event.createdBy);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <PageHeader title={event.title}>
          <Badge>{typeLabel}</Badge>
          {canManage && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/events/${eventId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </Link>
            </Button>
          )}
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Detail Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{formatTimestamp(event.date)}{event.endDate ? ` - ${formatTimestamp(event.endDate)}` : ""}</span></div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{event.location}</span></div>
            {event.description && <p className="text-sm text-muted-foreground pt-2">{event.description}</p>}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" />Statistik Peserta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">{event.participantCount || 0}</p>
              <p className="text-sm text-muted-foreground">Total Peserta</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{event.attendedCount || 0}</p>
              <p className="text-sm text-muted-foreground">Hadir</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-muted-foreground">
                {event.participantCount ? Math.round(((event.attendedCount || 0) / event.participantCount) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Tingkat Kehadiran</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base">Daftar Peserta</CardTitle>
            <CardDescription>Kelola data prospek yang diundang ke event ini</CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Peserta
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingParticipants ? (
            <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Belum ada peserta yang ditambahkan.</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Perusahaan / Prospek</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead className="w-[200px]">Status Kehadiran</TableHead>
                    <TableHead className="w-[100px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.companyName}</TableCell>
                      <TableCell>{p.picName}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">{p.notes || "-"}</TableCell>
                      <TableCell>
                        <Select 
                          value={p.attendanceStatus} 
                          onValueChange={(val) => { if (val) handleStatusChange(p.id, p.attendanceStatus, val as ParticipantAttendance); }}
                        >
                          <SelectTrigger className="h-8 w-[160px]">
                            <SelectValue>{(value: string) => PARTICIPANT_ATTENDANCE_LABELS[value as keyof typeof PARTICIPANT_ATTENDANCE_LABELS] || value}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {PARTICIPANT_ATTENDANCE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                          onClick={() => setDeleteParticipant({ id: p.id, status: p.attendanceStatus })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ParticipantForm 
        eventId={eventId} 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={handleParticipantAdded} 
      />

      {/* Delete Participant Confirmation */}
      <AlertDialog open={!!deleteParticipant} onOpenChange={() => setDeleteParticipant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Peserta?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus peserta ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingParticipant}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteParticipant}
              disabled={isDeletingParticipant}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingParticipant ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
