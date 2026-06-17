"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  where,
  orderBy,
  Timestamp,
} from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { Prospect } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

export function useProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchProspects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDocuments<Prospect>(COLLECTIONS.PROSPECTS, [
        orderBy("createdAt", "desc"),
      ]);
      setProspects(data);
    } catch (error) {
      console.error("Error fetching prospects:", error);
      toast.error("Gagal memuat data prospek");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProspect = async (data: Omit<Prospect, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addDocument(COLLECTIONS.PROSPECTS, data);
      toast.success("Prospek berhasil ditambahkan");
      await fetchProspects();
    } catch (error) {
      console.error("Error adding prospect:", error);
      toast.error("Gagal menambahkan prospek");
      throw error;
    }
  };

  const updateProspect = async (id: string, data: Partial<Prospect>) => {
    try {
      await updateDocument(COLLECTIONS.PROSPECTS, id, data);
      toast.success("Prospek berhasil diperbarui");
      await fetchProspects();
    } catch (error) {
      console.error("Error updating prospect:", error);
      toast.error("Gagal memperbarui prospek");
      throw error;
    }
  };

  const removeProspect = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.PROSPECTS, id);
      toast.success("Prospek berhasil dihapus");
      await fetchProspects();
    } catch (error) {
      console.error("Error deleting prospect:", error);
      toast.error("Gagal menghapus prospek");
      throw error;
    }
  };

  const getProspect = async (id: string) => {
    try {
      return await getDocument<Prospect>(COLLECTIONS.PROSPECTS, id);
    } catch (error) {
      console.error("Error getting prospect:", error);
      toast.error("Gagal memuat data prospek");
      return null;
    }
  };

  const getMyProspects = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getDocuments<Prospect>(COLLECTIONS.PROSPECTS, [
        where("createdBy", "==", user.uid),
        orderBy("createdAt", "desc"),
      ]);
      setProspects(data);
    } catch (error) {
      console.error("Error fetching my prospects:", error);
      toast.error("Gagal memuat data prospek");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getTodayFollowUps = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const data = await getDocuments<Prospect>(COLLECTIONS.PROSPECTS, [
        where("status", "==", "follow_up"),
        orderBy("updatedAt", "desc"),
      ]);

      // Client-side filter for follow up dates matching today
      return data.filter((p) => {
        const checkFollowUp = (fu?: { date: Timestamp | null }) => {
          if (!fu?.date) return false;
          const fuDate = fu.date.toDate();
          return fuDate >= today && fuDate < tomorrow;
        };
        return (
          checkFollowUp(p.followUp1) ||
          checkFollowUp(p.followUp2) ||
          checkFollowUp(p.followUp3)
        );
      });
    } catch (error) {
      console.error("Error fetching follow ups:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  return {
    prospects,
    isLoading,
    fetchProspects,
    addProspect,
    updateProspect,
    removeProspect,
    getProspect,
    getMyProspects,
    getTodayFollowUps,
  };
}
