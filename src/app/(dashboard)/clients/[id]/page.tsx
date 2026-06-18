"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { ClientTimeline } from "@/components/clients/client-timeline";
import { useClients } from "@/hooks/use-clients";
import { useClientTimeline } from "@/hooks/use-client-timeline";
import { useAuth } from "@/hooks/use-auth";
import { useActivities } from "@/hooks/use-activities";
import { formatTimestamp } from "@/lib/firebase/firestore";
import { SERVICE_STATUS_OPTIONS } from "@/lib/constants";
import { Client } from "@/types";
import { ArrowLeft, Building2, User, Briefcase, Clock, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
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

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { getClient, removeClient } = useClients();
  const { user, isAdmin } = useAuth();
  const { logActivity } = useActivities();
  const { timeline, isLoading: timelineLoading, fetchTimeline, addTimelineEntry } = useClientTimeline(clientId);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (clientId) {
        const data = await getClient(clientId);
        setClient(data);
        setIsLoading(false);
        fetchTimeline();
      }
    };
    load();
  }, [clientId]);

  const handleDelete = async () => {
    if (!client || !user) return;
    await removeClient(client.id);
    await logActivity(
      user.uid,
      user.displayName,
      "deleted_client",
      "client",
      client.id,
      client.companyName,
      `menghapus klien ${client.companyName}`
    );
    router.push("/clients");
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-[400px]" /></div>;
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium">Klien tidak ditemukan</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  const statusOption = SERVICE_STATUS_OPTIONS.find((o) => o.value === client.serviceStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title={client.companyName}>
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusOption?.color)}>
            {statusOption?.label}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/clients/${client.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            )}
          </div>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-blue-600" /> Informasi Klien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Perusahaan" value={client.companyName} />
            <InfoRow label="PIC" value={client.picName} />
            <InfoRow label="Telepon PIC" value={client.picPhone} />
            <InfoRow label="Email PIC" value={client.picEmail} />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4 text-violet-600" /> Detail Layanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Tanggal Sign" value={formatTimestamp(client.signDate)} />
            <InfoRow label="Jenis Layanan" value={client.serviceType} />
            <InfoRow label="PIC Internal" value={client.picInternalName} />
            <InfoRow label="Deadline" value={formatTimestamp(client.projectDeadline)} />
          </CardContent>
        </Card>

        {client.serviceNotes && (
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Catatan Pelayanan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{client.serviceNotes}</p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <div className="lg:col-span-2">
          <ClientTimeline
            clientId={clientId}
            timeline={timeline}
            isLoading={timelineLoading}
            onAddEntry={addTimelineEntry}
          />
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Klien?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data klien <span className="font-semibold">{client.companyName}</span> akan dihapus secara permanen.
            </AlertDialogDescription>
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

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%] truncate">{value || "-"}</span>
    </div>
  );
}
