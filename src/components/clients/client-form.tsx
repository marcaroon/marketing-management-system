"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientFormSchema, type ClientFormValues } from "@/lib/validations/client";
import { SERVICE_STATUS_OPTIONS, SERVICE_STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2, Briefcase } from "lucide-react";
import { UserProfile } from "@/types";

interface ClientFormProps {
  defaultValues?: Partial<ClientFormValues>;
  onSubmit: (data: ClientFormValues) => Promise<void>;
  isSubmitting?: boolean;
  teamMembers?: UserProfile[];
  mode?: "create" | "edit";
}

export function ClientForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  teamMembers = [],
  mode = "create",
}: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as any,
    defaultValues: {
      companyName: "",
      picName: "",
      picPhone: "",
      picEmail: "",
      signDate: new Date().toISOString().split("T")[0],
      serviceType: "",
      picInternalId: "",
      picInternalName: "",
      serviceStatus: "on_progress",
      projectDeadline: "",
      serviceNotes: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {/* Client Info */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-blue-600" />
              Informasi Klien
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nama Perusahaan *</FormLabel>
                  <FormControl>
                    <Input placeholder="PT. Contoh Indonesia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="picName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama PIC *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama PIC klien" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="picPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telepon PIC</FormLabel>
                  <FormControl>
                    <Input placeholder="08xxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="picEmail"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Email PIC</FormLabel>
                  <FormControl>
                    <Input placeholder="email@perusahaan.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Service Info */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4 text-violet-600" />
              Detail Layanan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
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
                      const member = teamMembers.find((m) => m.uid === val);
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
                            teamMembers.find((m) => m.uid === value)?.displayName || value
                          }
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map((member) => (
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
                  <Select
                    onValueChange={(v) => field.onChange(v || "")}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {(value: string) =>
                            SERVICE_STATUS_LABELS[
                              value as keyof typeof SERVICE_STATUS_LABELS
                            ] || value
                          }
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
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
                <FormItem className="sm:col-span-2">
                  <FormLabel>Catatan Layanan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan terkait pelayanan..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : mode === "create" ? (
              "Simpan Klien"
            ) : (
              "Perbarui Klien"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
