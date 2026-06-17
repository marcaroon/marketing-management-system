"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema, type EventFormValues } from "@/lib/validations/event";
import { EVENT_TYPE_OPTIONS, EVENT_TYPE_LABELS } from "@/lib/constants";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { useActivities } from "@/hooks/use-activities";
import { toTimestamp } from "@/lib/firebase/firestore";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, CalendarCheck } from "lucide-react";

export default function NewEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addEvent } = useEvents();
  const { user } = useAuth();
  const { logActivity } = useActivities();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema) as any,
    defaultValues: {
      title: "",
      type: "business_gathering",
      date: new Date().toISOString().split("T")[0],
      endDate: "",
      location: "",
      description: "",
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const eventData: Record<string, any> = {
        ...data,
        date: toTimestamp(new Date(data.date)),
        createdBy: user.uid,
      };
      if (data.endDate) {
        eventData.endDate = toTimestamp(new Date(data.endDate));
      }
      await addEvent(eventData as any);
      await logActivity(user.uid, user.displayName, "created_event", "event", "", data.title, `membuat event ${data.title}`);
      router.push("/events");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Buat Event Baru" description="Buat event Business Gathering atau Business Visit" />
      <Card className="border-border/50 max-w-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="h-4 w-4 text-blue-600" /> Detail Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Judul Event *</FormLabel><FormControl><Input placeholder="Nama event" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Tipe Event *</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v || "")} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue>{(value: string) => EVENT_TYPE_LABELS[value as keyof typeof EVENT_TYPE_LABELS] || value}</SelectValue></SelectTrigger></FormControl>
                    <SelectContent>{EVENT_TYPE_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Tanggal Mulai *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem><FormLabel>Tanggal Selesai</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Lokasi *</FormLabel><FormControl><Input placeholder="Lokasi event" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Textarea placeholder="Deskripsi event..." rows={4} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25">
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : "Buat Event"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
