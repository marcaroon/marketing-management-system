"use client";

import { cn } from "@/lib/utils";
import { PROSPECT_STATUS_OPTIONS, PRIORITY_OPTIONS, EVENT_ATTENDANCE_OPTIONS } from "@/lib/constants";
import { ProspectStatus, ProspectPriority, EventAttendanceStatus } from "@/types";

interface StatusBadgeProps {
  status: ProspectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const option = PROSPECT_STATUS_OPTIONS.find((o) => o.value === status);
  if (!option) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        option.color,
        className
      )}
    >
      {option.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority?: ProspectPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  if (!priority) return null;
  const option = PRIORITY_OPTIONS.find((o) => o.value === priority);
  if (!option) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        option.color,
        className
      )}
    >
      {option.label}
    </span>
  );
}

interface AttendanceBadgeProps {
  status?: EventAttendanceStatus;
  className?: string;
}

export function AttendanceBadge({ status, className }: AttendanceBadgeProps) {
  if (!status) return null;
  const option = EVENT_ATTENDANCE_OPTIONS.find((o) => o.value === status);
  if (!option) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        option.color,
        className
      )}
    >
      {option.label}
    </span>
  );
}
