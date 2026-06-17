import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(1, "Judul event wajib diisi"),
  type: z.enum(["business_gathering", "business_visit"]),
  date: z.string().min(1, "Tanggal event wajib diisi"),
  endDate: z.string().optional(),
  location: z.string().min(1, "Lokasi wajib diisi"),
  description: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
