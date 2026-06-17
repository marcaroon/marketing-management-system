import { z } from "zod";

export const userFormSchema = z.object({
  displayName: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
  phone: z.string().optional().default(""),
  role: z.enum(["admin", "marketing"]),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
});

export const loginFormSchema = z.object({
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
