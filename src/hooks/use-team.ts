"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDocuments,
  addDocument,
  updateDocument,
  orderBy,
} from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { UserProfile } from "@/types";
import { toast } from "sonner";

export function useTeam() {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDocuments<UserProfile>(COLLECTIONS.USERS, [
        orderBy("displayName", "asc"),
      ]);
      setMembers(data as unknown as UserProfile[]);
    } catch (error) {
      console.error("Error fetching team:", error);
      toast.error("Gagal memuat data tim");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMember = async (uid: string, data: Partial<UserProfile>) => {
    try {
      await updateDocument(COLLECTIONS.USERS, uid, data);
      toast.success("Data anggota berhasil diperbarui");
      await fetchMembers();
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Gagal memperbarui data anggota");
      throw error;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    isLoading,
    fetchMembers,
    updateMember,
  };
}
