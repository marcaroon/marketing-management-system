"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  orderBy,
  where,
} from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { MarketingEvent } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

export function useEvents() {
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDocuments<MarketingEvent>(COLLECTIONS.EVENTS, [
        orderBy("date", "desc"),
      ]);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Gagal memuat data event");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEvent = async (
    data: Omit<MarketingEvent, "id" | "createdAt" | "updatedAt" | "participantCount" | "attendedCount">
  ) => {
    try {
      await addDocument(COLLECTIONS.EVENTS, {
        ...data,
        participantCount: 0,
        attendedCount: 0,
      });
      toast.success("Event berhasil dibuat");
      await fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Gagal membuat event");
      throw error;
    }
  };

  const updateEvent = async (id: string, data: Partial<MarketingEvent>) => {
    try {
      await updateDocument(COLLECTIONS.EVENTS, id, data);
      toast.success("Event berhasil diperbarui");
      await fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Gagal memperbarui event");
      throw error;
    }
  };

  const removeEvent = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.EVENTS, id);
      toast.success("Event berhasil dihapus");
      await fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Gagal menghapus event");
      throw error;
    }
  };

  const getEvent = async (id: string) => {
    try {
      return await getDocument<MarketingEvent>(COLLECTIONS.EVENTS, id);
    } catch (error) {
      console.error("Error getting event:", error);
      toast.error("Gagal memuat data event");
      return null;
    }
  };

  const getMyEvents = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getDocuments<MarketingEvent>(COLLECTIONS.EVENTS, [
        where("createdBy", "==", user.uid),
        orderBy("date", "desc"),
      ]);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching my events:", error);
      toast.error("Gagal memuat data event");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    fetchEvents,
    addEvent,
    updateEvent,
    removeEvent,
    getEvent,
    getMyEvents,
  };
}
