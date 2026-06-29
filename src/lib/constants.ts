import {
  LeadSource,
  ProspectStatus,
  EventAttendanceStatus,
  ServiceStatus,
  ProspectPriority,
  EventType,
  ParticipantAttendance,
} from "@/types";

// ==================== PROSPECT STATUS ====================
export const PROSPECT_STATUS_OPTIONS: {
  value: ProspectStatus;
  label: string;
  color: string;
}[] = [
    {
      value: "prospek_baru",
      label: "Prospek Baru",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      value: "follow_up",
      label: "Follow Up",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    {
      value: "meeting",
      label: "Meeting",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    },
    {
      value: "negosiasi",
      label: "Negosiasi",
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    },
    {
      value: "closing",
      label: "Closing",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    {
      value: "reject",
      label: "Reject",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
    {
      value: "tidak_aktif",
      label: "Tidak Aktif",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    },
  ];

// ==================== LEAD SOURCE ====================
export const LEAD_SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: "business_gathering", label: "Business Gathering" },
  { value: "business_visit", label: "Business Visit" },
  { value: "referral", label: "Referral" },
  { value: "website", label: "Website" },
  { value: "cold_calling", label: "Cold Calling" },
  { value: "other", label: "Lainnya" },
];

// ==================== EVENT ATTENDANCE ====================
export const EVENT_ATTENDANCE_OPTIONS: {
  value: EventAttendanceStatus;
  label: string;
  color: string;
}[] = [
    {
      value: "email",
      label: "Email",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      value: "tidak_hadir",
      label: "Tidak Hadir",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
    {
      value: "menolak",
      label: "Menolak",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
    {
      value: "follow_up",
      label: "Follow Up",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    {
      value: "brosuring",
      label: "Brosuring",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    },
    {
      value: "hadir",
      label: "Hadir",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
  ];

// ==================== SERVICE STATUS ====================
export const SERVICE_STATUS_OPTIONS: {
  value: ServiceStatus;
  label: string;
  color: string;
}[] = [
    {
      value: "on_progress",
      label: "On Progress",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      value: "pending",
      label: "Pending",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    {
      value: "selesai",
      label: "Selesai",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
  ];

// ==================== PRIORITY ====================
export const PRIORITY_OPTIONS: {
  value: ProspectPriority;
  label: string;
  color: string;
}[] = [
    {
      value: "low",
      label: "Rendah",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    },
    {
      value: "medium",
      label: "Sedang",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    {
      value: "high",
      label: "Tinggi",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
  ];

// ==================== EVENT TYPE ====================
export const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "business_gathering", label: "Business Gathering" },
  { value: "business_visit", label: "Business Visit" },
];

// ==================== PARTICIPANT ATTENDANCE ====================
export const PARTICIPANT_ATTENDANCE_OPTIONS: {
  value: ParticipantAttendance;
  label: string;
}[] = [
    { value: "invited", label: "Diundang" },
    { value: "confirmed", label: "Konfirmasi" },
    { value: "attended", label: "Hadir" },
    { value: "absent", label: "Tidak Hadir" },
  ];

// ==================== LABEL LOOKUP MAPS ====================
// Pre-computed maps for fast value → label resolution (used by Select dropdowns)
export const PROSPECT_STATUS_LABELS = Object.fromEntries(
  PROSPECT_STATUS_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ProspectStatus, string>;

export const LEAD_SOURCE_LABELS = Object.fromEntries(
  LEAD_SOURCE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<LeadSource, string>;

export const EVENT_ATTENDANCE_LABELS = Object.fromEntries(
  EVENT_ATTENDANCE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<EventAttendanceStatus, string>;

export const SERVICE_STATUS_LABELS = Object.fromEntries(
  SERVICE_STATUS_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ServiceStatus, string>;

export const PRIORITY_LABELS = Object.fromEntries(
  PRIORITY_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ProspectPriority, string>;

export const EVENT_TYPE_LABELS = Object.fromEntries(
  EVENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<EventType, string>;

export const PARTICIPANT_ATTENDANCE_LABELS = Object.fromEntries(
  PARTICIPANT_ATTENDANCE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ParticipantAttendance, string>;

// ==================== KPI ACTIVITY METRICS ====================
export const KPI_ACTIVITY_METRIC_KEYS = [
  "closingSign",
  "nkMeet",
  "eventInvited",
  "eventConfirmed",
  "eventAttended",
  "eventFormFilled",
] as const;

export type KpiActivityMetricKey = (typeof KPI_ACTIVITY_METRIC_KEYS)[number];

export const KPI_ACTIVITY_METRIC_LABELS: Record<KpiActivityMetricKey, string> = {
  closingSign: "Closing/Sign",
  nkMeet: "NK/Meet",
  eventInvited: "Event: Diundang",
  eventConfirmed: "Event: Konfirmasi",
  eventAttended: "Event: Hadir",
  eventFormFilled: "Event: Isi Form",
};

// ==================== SIDEBAR MENU ====================
export const SIDEBAR_MENU = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["admin", "marketing"],
  },
  {
    title: "Prospek",
    href: "/prospects",
    icon: "UserSearch",
    roles: ["admin", "marketing"],
  },
  {
    title: "Klien Aktif",
    href: "/clients",
    icon: "Building2",
    roles: ["admin", "marketing"],
  },
  {
    title: "Event Marketing",
    href: "/events",
    icon: "CalendarCheck",
    roles: ["admin", "marketing"],
  },
  {
    title: "Kalender",
    href: "/calendar",
    icon: "Calendar",
    roles: ["admin", "marketing"],
  },
  {
    title: "KPI",
    href: "/kpi",
    icon: "TrendingUp",
    roles: ["admin", "marketing"],
  },
  { title: "Tim", href: "/team", icon: "Users", roles: ["admin"] },
  { title: "Laporan", href: "/reports", icon: "BarChart3", roles: ["admin"] },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: "Settings",
    roles: ["admin", "marketing"],
  },
] as const;

// ==================== COLLECTIONS ====================
export const COLLECTIONS = {
  USERS: "users",
  PROSPECTS: "prospects",
  CLIENTS: "clients",
  EVENTS: "events",
  ACTIVITIES: "activities",
  SETTINGS: "settings",
  TIMELINE: "timeline",
  PARTICIPANTS: "participants",
  KPI: "kpi",
  KPI_ACTIVITY: "kpi_activity",
} as const;
