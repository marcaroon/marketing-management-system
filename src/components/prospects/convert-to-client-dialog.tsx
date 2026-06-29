"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientFormSchema, type ClientFormValues } from "@/lib/validations/client";
import { SERVICE_STATUS_OPTIONS, SERVICE_STATUS_LABELS } from "@/lib/constants";
import { useClients } from "@/hooks/use-clients";
import { useProspects } from "@/hooks/use-prospects";
import { useTeam } from "@/hooks/use-team";
import { useAuth } from "@/hooks/use-auth";
import { useActivities } from "@/hooks/use-activities";
import { toTimestamp } from "@/lib/firebase/firestore";
import { Prospect } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRightLeft, TrendingUp } from "lucide-react";

interface ConvertToClientDialogProps {
  prospect: Prospect;
  isOpen: boolean;
  onClose: () => void;
}

export function ConvertToClientDialog({
  prospect,
  isOpen,
  onClose,
}: ConvertToClientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addClient } = useClients();
  const { updateProspect } = useProspects();
  const { members } = useTeam();
  const { user } = useAuth();
  const { logActivity } = useActivities();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as any,
    defaultValues: {
      companyName: prospect.companyName || "",
      picName: prospect.picName || "",
      picPhone: prospect.picPhone || "",
      picEmail: prospect.picEmail || "",
      signDate: new Date().toISOString().split("T")[0],
      serviceType: "",
      picInternalId: "",
      picInternalName: "",
      serviceStatus: "on_progress",
      projectDeadline: "",
      serviceNotes: "",
      contractValue: prospect.contractValue ?? undefined,
    },
  });

  const handleSubmit = async (data: ClientFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // Create client record
      await addClient({
        prospectId: prospect.id,
        companyName: data.companyName,
        picName: data.picName,
        picPhone: data.picPhone || "",
        picEmail: data.picEmail || "",
        signDate: toTimestamp(new Date(data.signDate)),
        serviceType: data.serviceType,
        picInternalId: data.picInternalId,
        picInternalName: data.picInternalName || "",
        serviceStatus: data.serviceStatus,
        projectDeadline: toTimestamp(new Date(data.projectDeadline)),
        serviceNotes: data.serviceNotes || "",
        contractValue: data.contractValue,
        createdBy: user.uid,
      } as any);

      // Log activity
      await logActivity(
        user.uid,
        user.displayName,
        "converted_to_client",
        "client",
        prospect.id,
        data.companyName,
        `mengkonversi prospek ${data.companyName} menjadi klien aktif`
      );

      onClose();
      router.push("/clients");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
            Konversi ke Klien Aktif
          </DialogTitle>
          <DialogDescription>
            Konversi prospek <span className="font-semibold">{prospect.companyName}</span> menjadi klien aktif.
            Data perusahaan dan PIC akan otomatis terisi.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
            {/* Pre-filled from prospect (read-only display) */}
            <div className="rounded-lg bg-accent/50 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data dari Prospek</p>
              <p className="text-sm"><span className="text-muted-foreground">Perusahaan:</span> {prospect.companyName}</p>
              <p className="text-sm"><span className="text-muted-foreground">PIC:</span> {prospect.picName}</p>
              {prospect.picPhone && <p className="text-sm"><span className="text-muted-foreground">HP:</span> {prospect.picPhone}</p>}
            </div>

            {/* Service details */}
            <FormField
              control={form.control}
              name="signDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Sign *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Layanan *</FormLabel>
                  <FormControl>
                    <Input placeholder="Konsultasi ISO, OHSAS, dll" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="picInternalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIC Internal *</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      const member = members.find((m) => m.uid === val);
                      if (member) {
                        form.setValue("picInternalName", member.displayName);
                      }
                    }}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih PIC internal">
                          {(value: string) =>
                            members.find((m) => m.uid === value)?.displayName || value
                          }
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.uid} value={member.uid}>
                          {member.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Layanan</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v || "")} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {(value: string) =>
                            SERVICE_STATUS_LABELS[value as keyof typeof SERVICE_STATUS_LABELS] || value
                          }
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectDeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline Project *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Layanan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Catatan tambahan..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nilai Kontrak */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                <TrendingUp className="h-4 w-4" />
                Nilai Kontrak
              </p>
              <FormField
                control={form.control}
                name="contractValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nilai Kontrak (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Contoh: 50000000"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? undefined : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nilai ini digunakan untuk perhitungan KPI omzet. Bisa diperbarui nanti.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengkonversi...
                  </>
                ) : (
                  "Konversi ke Klien"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
