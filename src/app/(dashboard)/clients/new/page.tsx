"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { useClients } from "@/hooks/use-clients";
import { useTeam } from "@/hooks/use-team";
import { useAuth } from "@/hooks/use-auth";
import { useActivities } from "@/hooks/use-activities";
import { toTimestamp } from "@/lib/firebase/firestore";
import type { ClientFormValues } from "@/lib/validations/client";

export default function NewClientPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addClient } = useClients();
  const { members } = useTeam();
  const { user } = useAuth();
  const { logActivity } = useActivities();

  const handleSubmit = async (data: ClientFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const clientData: Record<string, any> = {
        ...data,
        prospectId: "",
        signDate: toTimestamp(new Date(data.signDate)),
        projectDeadline: toTimestamp(new Date(data.projectDeadline)),
        createdBy: user.uid,
      };

      await addClient(clientData as any);
      await logActivity(
        user.uid,
        user.displayName,
        "created_client",
        "client",
        "",
        data.companyName,
        `menambahkan klien ${data.companyName}`
      );
      router.push("/clients");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Klien Baru"
        description="Input data klien aktif baru"
      />
      <ClientForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        teamMembers={members}
        mode="create"
      />
    </div>
  );
}
