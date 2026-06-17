"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { useClients } from "@/hooks/use-clients";
import { useTeam } from "@/hooks/use-team";
import { useAuth } from "@/hooks/use-auth";
import { useActivities } from "@/hooks/use-activities";
import { toTimestamp } from "@/lib/firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClientFormValues } from "@/lib/validations/client";
import { Client } from "@/types";

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const { getClient, updateClient } = useClients();
  const { members } = useTeam();
  const { user } = useAuth();
  const { logActivity } = useActivities();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (params.id) {
        const data = await getClient(params.id as string);
        setClient(data);
        setIsLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!client) {
    router.back();
    return null;
  }

  const dateToString = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      return timestamp.toDate().toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const defaultValues: Partial<ClientFormValues> = {
    companyName: client.companyName || "",
    picName: client.picName || "",
    picPhone: client.picPhone || "",
    picEmail: client.picEmail || "",
    signDate: dateToString(client.signDate),
    serviceType: client.serviceType || "",
    picInternalId: client.picInternalId || "",
    picInternalName: client.picInternalName || "",
    serviceStatus: client.serviceStatus,
    projectDeadline: dateToString(client.projectDeadline),
    serviceNotes: client.serviceNotes || "",
  };

  const handleSubmit = async (data: ClientFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const updateData: Record<string, any> = {
        ...data,
        signDate: toTimestamp(new Date(data.signDate)),
        projectDeadline: toTimestamp(new Date(data.projectDeadline)),
      };

      await updateClient(client.id, updateData as any);
      await logActivity(
        user.uid,
        user.displayName,
        "updated_client",
        "client",
        client.id,
        data.companyName,
        `memperbarui data klien ${data.companyName}`
      );
      router.push(`/clients/${client.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${client.companyName}`}
        description="Perbarui data klien"
      />
      <ClientForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        teamMembers={members}
        mode="edit"
      />
    </div>
  );
}
