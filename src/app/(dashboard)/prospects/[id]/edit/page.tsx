"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProspectForm } from "@/components/prospects/prospect-form";
import { useProspects } from "@/hooks/use-prospects";
import { useTeam } from "@/hooks/use-team";
import { useAuth } from "@/hooks/use-auth";
import { useActivities } from "@/hooks/use-activities";
import { toTimestamp, formatTimestamp } from "@/lib/firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProspectFormValues } from "@/lib/validations/prospect";
import { Prospect } from "@/types";

export default function EditProspectPage() {
  const params = useParams();
  const router = useRouter();
  const { getProspect, updateProspect } = useProspects();
  const { members } = useTeam();
  const { user, canEdit } = useAuth();
  const { logActivity } = useActivities();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProspect = async () => {
      if (params.id) {
        const data = await getProspect(params.id as string);
        setProspect(data);
        setIsLoading(false);
      }
    };
    loadProspect();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!prospect || !canEdit(prospect.createdBy)) {
    router.back();
    return null;
  }

  // Convert Timestamps to string format for the form
  const dateToString = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      return timestamp.toDate().toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const defaultValues: Partial<ProspectFormValues> = {
    companyName: prospect.companyName,
    officePhone: prospect.officePhone || "",
    directorName: prospect.directorName || "",
    district: prospect.district || "",
    city: prospect.city || "",
    businessField: prospect.businessField || "",
    employeeCount: prospect.employeeCount || 0,
    ssTs: prospect.ssTs || "",
    picName: prospect.picName,
    picPhone: prospect.picPhone || "",
    picEmail: prospect.picEmail || "",
    sendDate: dateToString(prospect.sendDate),
    ccdId: prospect.ccdId || "",
    ccdName: prospect.ccdName || "",
    leadSource: prospect.leadSource,
    status: prospect.status,
    eventAttendanceStatus: prospect.eventAttendanceStatus,
    priority: prospect.priority,
    notes: prospect.notes || "",
    tags: prospect.tags || [],
    followUp1: {
      date: dateToString(prospect.followUp1?.date),
      notes: prospect.followUp1?.notes || "",
      status: prospect.followUp1?.status || "",
    },
    followUp2: {
      date: dateToString(prospect.followUp2?.date),
      notes: prospect.followUp2?.notes || "",
      status: prospect.followUp2?.status || "",
    },
    followUp3: {
      date: dateToString(prospect.followUp3?.date),
      notes: prospect.followUp3?.notes || "",
      status: prospect.followUp3?.status || "",
    },
  };

  const handleSubmit = async (data: ProspectFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const updateData: Record<string, any> = {
        ...data,
        sendDate: toTimestamp(new Date(data.sendDate)),
      };

      // Only include followUp fields with proper values
      for (const key of ["followUp1", "followUp2", "followUp3"] as const) {
        const fu = data[key];
        if (fu?.date) {
          updateData[key] = { ...fu, date: toTimestamp(new Date(fu.date)) };
        } else if (fu?.notes || fu?.status) {
          updateData[key] = { date: null, notes: fu.notes || "", status: fu.status || "" };
        } else if (prospect[key]) {
          // Preserve existing followUp data if form didn't change it
          updateData[key] = prospect[key];
        }
        // If neither form nor existing data has it, don't include the field
      }

      await updateProspect(prospect.id, updateData as any);
      await logActivity(
        user.uid,
        user.displayName,
        "updated_prospect",
        "prospect",
        prospect.id,
        data.companyName,
        `memperbarui prospek ${data.companyName}`
      );
      router.push(`/prospects/${prospect.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${prospect.companyName}`}
        description="Perbarui data prospek"
      />
      <ProspectForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        teamMembers={members}
        mode="edit"
      />
    </div>
  );
}
