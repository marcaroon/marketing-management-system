import { z } from "zod";

export const clientFormSchema = z.object({
  companyName: z.string().min(1, "Nama perusahaan wajib diisi"),
  picName: z.string().min(1, "Nama PIC wajib diisi"),
  picPhone: z.string().optional().default(""),
  picEmail: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  signDate: z.string().min(1, "Tanggal sign wajib diisi"),
  serviceType: z.string().min(1, "Jenis layanan wajib diisi"),
  picInternalId: z.string().min(1, "PIC Internal wajib dipilih"),
  picInternalName: z.string().optional().default(""),
  serviceStatus: z.enum(["on_progress", "pending", "selesai"]),
  projectDeadline: z.string().min(1, "Deadline project wajib diisi"),
  serviceNotes: z.string().optional().default(""),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
