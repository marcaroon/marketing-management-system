"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProspectForm } from "@/components/prospects/prospect-form";
import { useProspects } from "@/hooks/use-prospects";
import { useTeam } from "@/hooks/use-team";
import { useAuth } from "@/hooks/use-auth";
import { useActivities } from "@/hooks/use-activities";
import { toTimestamp } from "@/lib/firebase/firestore";
import type { ProspectFormValues } from "@/lib/validations/prospect";

export default function NewProspectPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addProspect } = useProspects();
  const { members } = useTeam();
  const { user } = useAuth();
  const { logActivity } = useActivities();

  const handleSubmit = async (data: ProspectFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const prospectData: Record<string, any> = {
        ...data,
        sendDate: toTimestamp(new Date(data.sendDate)),
        createdBy: user.uid,
      };

      // Only include followUp fields if they have meaningful data
      for (const key of ["followUp1", "followUp2", "followUp3"] as const) {
        const fu = data[key];
        if (fu?.date) {
          prospectData[key] = { ...fu, date: toTimestamp(new Date(fu.date)) };
        } else if (fu?.notes || fu?.status) {
          prospectData[key] = { date: null, notes: fu.notes || "", status: fu.status || "" };
        }
        // If no data at all, don't include the field (omit rather than undefined)
      }

      await addProspect(prospectData as any);
      await logActivity(
        user.uid,
        user.displayName,
        "created_prospect",
        "prospect",
        "",
        data.companyName,
        `menambahkan prospek ${data.companyName}`
      );
      router.push("/prospects");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Prospek Baru"
        description="Input data prospek perusahaan baru"
      />
      <ProspectForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        teamMembers={members}
        mode="create"
      />
    </div>
  );
}
