"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProspects } from "@/hooks/use-prospects";
import { ParticipantAttendance } from "@/types";
import { PARTICIPANT_ATTENDANCE_OPTIONS, PARTICIPANT_ATTENDANCE_LABELS } from "@/lib/constants";
import { useEventParticipants } from "@/hooks/use-event-participants";

interface ParticipantFormProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ParticipantForm({ eventId, isOpen, onClose, onSuccess }: ParticipantFormProps) {
  const { prospects } = useProspects();
  const { addParticipant } = useEventParticipants(eventId);
  
  const [selectedProspectId, setSelectedProspectId] = useState<string>("");
  const [attendanceStatus, setAttendanceStatus] = useState<ParticipantAttendance>("invited");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProspectId) return;

    const prospect = prospects.find(p => p.id === selectedProspectId);
    if (!prospect) return;

    setIsSubmitting(true);
    try {
      await addParticipant({
        prospectId: prospect.id,
        companyName: prospect.companyName,
        picName: prospect.picName,
        attendanceStatus,
        notes,
      });
      onSuccess();
      onClose();
      // Reset form
      setSelectedProspectId("");
      setAttendanceStatus("invited");
      setNotes("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Peserta</DialogTitle>
            <DialogDescription>
              Pilih prospek untuk ditambahkan sebagai peserta event ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prospect">Prospek / Perusahaan</Label>
              <Select value={selectedProspectId} onValueChange={(val) => { if (val) setSelectedProspectId(val); }} required>
                <SelectTrigger id="prospect">
                  <SelectValue placeholder="Pilih prospek...">{(value: string) => { const p = prospects.find(p => p.id === value); return p ? `${p.companyName} (${p.picName})` : value; }}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {prospects.map((prospect) => (
                    <SelectItem key={prospect.id} value={prospect.id}>
                      {prospect.companyName} ({prospect.picName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status Kehadiran</Label>
              <Select 
                value={attendanceStatus} 
                onValueChange={(val) => { if (val) setAttendanceStatus(val as ParticipantAttendance); }}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih status...">{(value: string) => PARTICIPANT_ATTENDANCE_LABELS[value as keyof typeof PARTICIPANT_ATTENDANCE_LABELS] || value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PARTICIPANT_ATTENDANCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan jika ada..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedProspectId}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
