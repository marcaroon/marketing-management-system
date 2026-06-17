"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge, AttendanceBadge } from "@/components/prospects/status-badge";
import { ConvertToClientDialog } from "@/components/prospects/convert-to-client-dialog";
import { useProspects } from "@/hooks/use-prospects";
import { useAuth } from "@/hooks/use-auth";
import { formatTimestamp } from "@/lib/firebase/firestore";
import { LEAD_SOURCE_OPTIONS } from "@/lib/constants";
import { Prospect } from "@/types";
import {
  Edit,
  Trash2,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  MessageSquare,
  ArrowLeft,
  ArrowRightLeft,
} from "lucide-react";
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

export default function ProspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getProspect, removeProspect } = useProspects();
  const { canEdit, canDelete } = useAuth();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadProspect = async () => {
      if (params.id) {
        const data = await getProspect(params.id as string);
        setProspect(data);
        setIsLoading(false);
      }
    };
    loadProspect();
  }, [params.id]);

  const handleDelete = async () => {
    if (!prospect) return;
    await removeProspect(prospect.id);
    router.push("/prospects");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-foreground">Prospek tidak ditemukan</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  const leadSourceLabel = LEAD_SOURCE_OPTIONS.find(
    (o) => o.value === prospect.leadSource
  )?.label;

  const renderFollowUp = (label: string, fu?: { date: any; notes: string; status: string }) => {
    if (!fu?.date && !fu?.notes && !fu?.status) return null;
    return (
      <div className="rounded-lg border border-border/50 p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">{label}</h4>
        <div className="grid gap-2 text-sm">
          {fu.date && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal:</span>
              <span>{formatTimestamp(fu.date)}</span>
            </div>
          )}
          {fu.status && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span>{fu.status}</span>
            </div>
          )}
          {fu.notes && (
            <div>
              <span className="text-muted-foreground">Catatan:</span>
              <p className="mt-1">{fu.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title={prospect.companyName}>
          <div className="flex items-center gap-2">
            <StatusBadge status={prospect.status} />
            <PriorityBadge priority={prospect.priority} />
          </div>
          <div className="flex items-center gap-2">
            {/* Convert to Client button - shown when status is closing */}
            {prospect.status === "closing" && (
              <Button
                size="sm"
                onClick={() => setShowConvertDialog(true)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800"
              >
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Konversi ke Klien
              </Button>
            )}
            {canEdit(prospect.createdBy) && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/prospects/${prospect.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
            {canDelete() && (
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
        {/* Company Info */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-blue-600" />
              Informasi Perusahaan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Nama Perusahaan" value={prospect.companyName} />
            <InfoRow label="Nomor Kantor" value={prospect.officePhone} />
            <InfoRow label="Nama Direktur" value={prospect.directorName} />
            <InfoRow label="Kecamatan" value={prospect.district} />
            <InfoRow label="Kota" value={prospect.city} />
            <InfoRow label="Bidang Usaha" value={prospect.businessField} />
            <InfoRow label="Jumlah Karyawan" value={prospect.employeeCount?.toString()} />
            <InfoRow label="SS / TS" value={prospect.ssTs} />
          </CardContent>
        </Card>

        {/* PIC & Marketing Info */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-emerald-600" />
              PIC & Marketing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Nama PIC" value={prospect.picName} />
            <InfoRow label="Nomor HP" value={prospect.picPhone} />
            <InfoRow label="Email" value={prospect.picEmail} />
            <Separator className="my-3" />
            <InfoRow label="Tanggal Kirim" value={formatTimestamp(prospect.sendDate)} />
            <InfoRow label="CCD" value={prospect.ccdName} />
            <InfoRow label="Sumber Lead" value={leadSourceLabel || "-"} />
            {prospect.eventAttendanceStatus && (
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Kehadiran Event</span>
                <AttendanceBadge status={prospect.eventAttendanceStatus} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Follow Up */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-cyan-600" />
              Follow Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {renderFollowUp("Follow Up 1", prospect.followUp1) || (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  Follow Up 1 belum diisi
                </div>
              )}
              {renderFollowUp("Follow Up 2", prospect.followUp2) || (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  Follow Up 2 belum diisi
                </div>
              )}
              {renderFollowUp("Follow Up 3", prospect.followUp3) || (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  Follow Up 3 belum diisi
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {prospect.notes && (
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Catatan Internal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{prospect.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Convert to Client Dialog */}
      {prospect.status === "closing" && (
        <ConvertToClientDialog
          prospect={prospect}
          isOpen={showConvertDialog}
          onClose={() => setShowConvertDialog(false)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Prospek?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data prospek <span className="font-semibold">{prospect.companyName}</span> akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
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
      <span className="text-sm font-medium text-foreground text-right max-w-[60%] truncate">
        {value || "-"}
      </span>
    </div>
  );
}
