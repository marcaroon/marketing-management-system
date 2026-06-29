import { z } from "zod";

export const followUpSchema = z.object({
  date: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

export const prospectFormSchema = z.object({
  // Informasi Perusahaan
  companyName: z.string().min(1, "Nama perusahaan wajib diisi"),
  officePhone: z.string().optional(),
  directorName: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  businessField: z.string().optional(),
  employeeCount: z.coerce.number().min(0).optional(),
  ssTs: z.string().optional(),

  // PIC Perusahaan
  picName: z.string().min(1, "Nama PIC wajib diisi"),
  picPhone: z.string().optional(),
  picEmail: z.string().email("Format email tidak valid").optional().or(z.literal("")),

  // Informasi Marketing
  sendDate: z.string().min(1, "Tanggal kirim wajib diisi"),
  ccdId: z.string().min(1, "CCD wajib dipilih"),
  ccdName: z.string().optional(),
  leadSource: z.enum([
    "business_gathering",
    "business_visit",
    "referral",
    "website",
    "cold_calling",
    "other",
  ]),

  // Status
  status: z.enum([
    "prospek_baru",
    "follow_up",
    "meeting",
    "negosiasi",
    "closing",
    "reject",
    "tidak_aktif",
  ]),
  eventAttendanceStatus: z
    .enum(["email", "tidak_hadir", "menolak", "follow_up", "brosuring", "hadir"])
    .optional(),

  // Follow Up
  followUp1: followUpSchema.optional(),
  followUp2: followUpSchema.optional(),
  followUp3: followUpSchema.optional(),

  // Metadata
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  notes: z.string().optional(),

  // Nilai kontrak (diisi saat status closing)
  contractValue: z.coerce.number().min(0).optional(),
});

export type ProspectFormValues = z.infer<typeof prospectFormSchema>;
