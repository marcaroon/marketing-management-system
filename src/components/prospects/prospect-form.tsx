"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { prospectFormSchema, type ProspectFormValues } from "@/lib/validations/prospect";
import { PROSPECT_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS, PRIORITY_OPTIONS, EVENT_ATTENDANCE_OPTIONS, PROSPECT_STATUS_LABELS, LEAD_SOURCE_LABELS, PRIORITY_LABELS, EVENT_ATTENDANCE_LABELS } from "@/lib/constants";
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
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Building2, User, Briefcase, Activity, MessageSquare } from "lucide-react";
import { UserProfile } from "@/types";

interface ProspectFormProps {
  defaultValues?: Partial<ProspectFormValues>;
  onSubmit: (data: ProspectFormValues) => Promise<void>;
  isSubmitting?: boolean;
  teamMembers?: UserProfile[];
  mode?: "create" | "edit";
}

export function ProspectForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  teamMembers = [],
  mode = "create",
}: ProspectFormProps) {
  const form = useForm<ProspectFormValues>({
    resolver: zodResolver(prospectFormSchema) as any,
    defaultValues: {
      companyName: "",
      officePhone: "",
      directorName: "",
      district: "",
      city: "",
      businessField: "",
      employeeCount: 0,
      ssTs: "",
      picName: "",
      picPhone: "",
      picEmail: "",
      sendDate: new Date().toISOString().split("T")[0],
      ccdId: "",
      ccdName: "",
      leadSource: "cold_calling",
      status: "prospek_baru",
      tags: [],
      priority: "medium",
      notes: "",
      followUp1: { date: "", notes: "", status: "" },
      followUp2: { date: "", notes: "", status: "" },
      followUp3: { date: "", notes: "", status: "" },
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informasi Perusahaan */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-blue-600" />
              Informasi Perusahaan
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
              name="officePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Kantor</FormLabel>
                  <FormControl>
                    <Input placeholder="021-xxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="directorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Direktur</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama direktur" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kecamatan</FormLabel>
                  <FormControl>
                    <Input placeholder="Kecamatan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kota</FormLabel>
                  <FormControl>
                    <Input placeholder="Kota" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bidang Usaha</FormLabel>
                  <FormControl>
                    <Input placeholder="Bidang usaha perusahaan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Karyawan</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ssTs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SS / TS</FormLabel>
                  <FormControl>
                    <Input placeholder="SS / TS" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* PIC Perusahaan */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-emerald-600" />
              PIC Perusahaan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="picName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nama PIC *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama person in charge" {...field} />
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
                  <FormLabel>Nomor HP</FormLabel>
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
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@perusahaan.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Informasi Marketing */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4 text-violet-600" />
              Informasi Marketing
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="sendDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Kirim *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ccdId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CCD (Marketing) *</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      const member = teamMembers.find((m) => m.uid === val);
                      if (member) {
                        form.setValue("ccdName", member.displayName);
                      }
                    }}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih marketing">{(value: string) => teamMembers.find((m) => m.uid === value)?.displayName || value}</SelectValue>
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
              name="leadSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sumber Lead</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v || "")} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sumber lead">{(value: string) => LEAD_SOURCE_LABELS[value as keyof typeof LEAD_SOURCE_LABELS] || value}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LEAD_SOURCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioritas</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v || "")} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih prioritas">{(value: string) => PRIORITY_LABELS[value as keyof typeof PRIORITY_LABELS] || value}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-amber-600" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Prospek</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v || "")} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status">{(value: string) => PROSPECT_STATUS_LABELS[value as keyof typeof PROSPECT_STATUS_LABELS] || value}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROSPECT_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="eventAttendanceStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Kehadiran Event</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v || "")} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status kehadiran">{(value: string) => EVENT_ATTENDANCE_LABELS[value as keyof typeof EVENT_ATTENDANCE_LABELS] || value}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EVENT_ATTENDANCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Catatan Internal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan..."
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

        {/* Follow Up */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-cyan-600" />
              Follow Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion className="w-full">
              {[1, 2, 3].map((num) => (
                <AccordionItem key={num} value={`followup-${num}`}>
                  <AccordionTrigger className="text-sm font-medium">
                    Follow Up {num}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 pt-2 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`followUp${num as 1 | 2 | 3}.date` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tanggal</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`followUp${num as 1 | 2 | 3}.status` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status Hasil</FormLabel>
                            <FormControl>
                              <Input placeholder="Hasil follow up" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`followUp${num as 1 | 2 | 3}.notes` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Catatan</FormLabel>
                            <FormControl>
                              <Input placeholder="Catatan follow up" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
              "Simpan Prospek"
            ) : (
              "Perbarui Prospek"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
