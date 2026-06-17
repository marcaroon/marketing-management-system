"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientTimeline } from "@/hooks/use-client-timeline";
import { useAuth } from "@/hooks/use-auth";
import { formatTimestamp } from "@/lib/firebase/firestore";
import { ClientTimelineEntry } from "@/types";
import { Clock, Plus, User, FileText, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMELINE_ACTIONS = [
  { value: "status_update", label: "Update Status", icon: CheckCircle, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50" },
  { value: "note_added", label: "Catatan Ditambahkan", icon: MessageSquare, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/50" },
  { value: "meeting", label: "Meeting", icon: User, color: "text-violet-600 bg-violet-100 dark:bg-violet-900/50" },
  { value: "document", label: "Dokumen", icon: FileText, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/50" },
  { value: "issue", label: "Masalah / Issue", icon: AlertCircle, color: "text-red-600 bg-red-100 dark:bg-red-900/50" },
  { value: "other", label: "Lainnya", icon: Clock, color: "text-gray-600 bg-gray-100 dark:bg-gray-900/50" },
];

interface ClientTimelineProps {
  clientId: string;
  timeline: ClientTimelineEntry[];
  isLoading: boolean;
  onAddEntry: (action: string, description: string, userId: string, userName: string) => Promise<void>;
}

export function ClientTimeline({ clientId, timeline, isLoading, onAddEntry }: ClientTimelineProps) {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [action, setAction] = useState("note_added");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !description.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddEntry(action, description, user.uid, user.displayName);
      setDescription("");
      setAction("note_added");
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionInfo = (actionKey: string) => {
    return TIMELINE_ACTIONS.find((a) => a.value === actionKey) || TIMELINE_ACTIONS[TIMELINE_ACTIONS.length - 1];
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-cyan-600" />
            Timeline Aktivitas
          </CardTitle>
          <CardDescription>Riwayat aktivitas dan perubahan klien</CardDescription>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Tambah
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : timeline.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Belum ada aktivitas tercatat.
          </div>
        ) : (
          <div className="relative ml-4 space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

            {timeline.map((entry, index) => {
              const actionInfo = getActionInfo(entry.action);
              const Icon = actionInfo.icon;
              return (
                <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Dot */}
                  <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${actionInfo.color}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {actionInfo.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        oleh {entry.userName}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                      {entry.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatTimestamp(entry.createdAt, { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Add Timeline Entry Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Aktivitas Timeline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium">Jenis Aktivitas</label>
              <Select value={action} onValueChange={(v) => { if (v) setAction(v); }}>
                <SelectTrigger className="mt-1">
                  <SelectValue>{(value: string) => TIMELINE_ACTIONS.find((a) => a.value === value)?.label || value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TIMELINE_ACTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Deskripsi</label>
              <Textarea
                className="mt-1"
                placeholder="Deskripsi aktivitas..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !description.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
