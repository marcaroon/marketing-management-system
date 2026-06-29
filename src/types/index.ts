import { Timestamp } from "firebase/firestore";

// ==================== USER ====================
export type UserRole = "admin" | "marketing";
export type UserStatus = "active" | "inactive";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== PROSPECT ====================
export type LeadSource =
  | "business_gathering"
  | "business_visit"
  | "referral"
  | "website"
  | "cold_calling"
  | "other";

export type ProspectStatus =
  | "prospek_baru"
  | "follow_up"
  | "meeting"
  | "negosiasi"
  | "closing"
  | "reject"
  | "tidak_aktif";

export type EventAttendanceStatus =
  | "email"
  | "tidak_hadir"
  | "menolak"
  | "follow_up"
  | "brosuring"
  | "hadir";

export type ProspectPriority = "low" | "medium" | "high";

export interface FollowUp {
  date: Timestamp | null;
  notes: string;
  status: string;
}

export interface Prospect {
  id: string;

  // Informasi Perusahaan
  companyName: string;
  officePhone: string;
  directorName: string;
  district: string;
  city: string;
  businessField: string;
  employeeCount: number;
  ssTs: string;

  // PIC Perusahaan
  picName: string;
  picPhone: string;
  picEmail: string;

  // Informasi Marketing
  sendDate: Timestamp;
  ccdId: string;
  ccdName: string;
  leadSource: LeadSource;

  // Status
  status: ProspectStatus;
  eventAttendanceStatus?: EventAttendanceStatus;

  // Follow Up
  followUp1?: FollowUp;
  followUp2?: FollowUp;
  followUp3?: FollowUp;

  // Nilai Kontrak (diisi saat status = closing)
  contractValue?: number;

  // Metadata
  tags?: string[];
  priority?: ProspectPriority;
  notes?: string;

  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== CLIENT ====================
export type ServiceStatus = "on_progress" | "pending" | "selesai";

export interface Client {
  id: string;
  prospectId: string;

  // From prospect
  companyName: string;
  picName: string;
  picPhone: string;
  picEmail: string;

  // Client specific
  signDate: Timestamp;
  serviceType: string;
  picInternalId: string;
  picInternalName: string;
  serviceStatus: ServiceStatus;
  projectDeadline: Timestamp;
  serviceNotes: string;
  contractValue?: number;

  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ClientTimelineEntry {
  id: string;
  clientId: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
}

// ==================== EVENT ====================
export type EventType = "business_gathering" | "business_visit";
export type ParticipantAttendance =
  | "invited"
  | "confirmed"
  | "attended"
  | "absent";

export interface MarketingEvent {
  id: string;
  title: string;
  type: EventType;
  date: Timestamp;
  endDate?: Timestamp;
  location: string;
  description: string;
  participantCount: number;
  attendedCount: number;
  documentationUrls?: string[];

  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  prospectId: string;
  companyName: string;
  picName: string;
  attendanceStatus: ParticipantAttendance;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== ACTIVITY ====================
export type ActivityTargetType = "prospect" | "client" | "event" | "user";

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: ActivityTargetType;
  targetId: string;
  targetName: string;
  description: string;
  createdAt: Timestamp;
}

// ==================== SETTINGS ====================
export interface CompanySettings {
  companyName: string;
  companyLogo?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface NotificationSettings {
  followUpReminderEnabled: boolean;
  followUpReminderDays: number;
}

// ==================== KPI ====================

/**
 * Mode distribusi target KPI:
 *   "top_down"   – total tahunan ditetapkan oleh admin, target per-CCO dihitung otomatis (rata-rata)
 *   "bottom_up"  – target per-CCO diinput individual, total tahunan = jumlah semua target individual
 */
export type KpiDistributionMode = "top_down" | "bottom_up";

/**
 * Target KPI per CCO (marketing user) dalam satu tahun.
 * Disimpan sebagai sub-map di dalam KpiYear.
 */
export interface KpiCcoTarget {
  ccoId: string;
  ccoName: string;
  /** Target tahunan untuk CCO ini (dalam Rupiah) */
  annualTarget: number;
  /** Override per bulan: key = "YYYY-MM", value = target (Rupiah).
   *  Jika key tidak ada, target bulanan = annualTarget / 12. */
  monthlyOverrides: Record<string, number>;
}

/**
 * Dokumen KPI untuk satu tahun.
 * Collection path: kpi/{year}
 */
export interface KpiYear {
  id: string; // = year string, e.g. "2026"
  year: number;
  /** Total target omzet tahunan perusahaan */
  annualTarget: number;
  distributionMode: KpiDistributionMode;
  /** Map ccoId → target per CCO */
  ccoTargets: Record<string, KpiCcoTarget>;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Data realisasi omzet yang dihitung dari prospect closing */
export interface KpiRealization {
  ccoId: string;
  ccoName: string;
  /** Total realisasi tahunan */
  annualActual: number;
  /** Realisasi per bulan: key = "YYYY-MM", value = total (Rupiah) */
  monthlyActual: Record<string, number>;
}
