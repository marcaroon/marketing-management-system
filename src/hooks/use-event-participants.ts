"use client";

import { useState, useCallback } from "react";
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  where,
  orderBy,
} from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { EventParticipant, MarketingEvent, ParticipantAttendance } from "@/types";
import { toast } from "sonner";

export function useEventParticipants(eventId?: string) {
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchParticipants = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const data = await getDocuments<EventParticipant>(COLLECTIONS.PARTICIPANTS, [
        where("eventId", "==", eventId),
      ]);
      // Sort client-side to avoid needing a composite index in Firestore
      const sortedData = data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA; // desc
      });
      setParticipants(sortedData);
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast.error("Gagal memuat data peserta");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const addParticipant = async (data: Omit<EventParticipant, "id" | "eventId" | "createdAt" | "updatedAt">) => {
    if (!eventId) throw new Error("Event ID is required");
    try {
      // Get current event to update stats
      const event = await getDocument<MarketingEvent>(COLLECTIONS.EVENTS, eventId);
      if (!event) throw new Error("Event not found");

      // Add participant
      await addDocument(COLLECTIONS.PARTICIPANTS, {
        ...data,
        eventId,
      });

      // Update event stats
      const newParticipantCount = (event.participantCount || 0) + 1;
      const newAttendedCount = data.attendanceStatus === "attended"
        ? (event.attendedCount || 0) + 1
        : (event.attendedCount || 0);

      await updateDocument(COLLECTIONS.EVENTS, eventId, {
        participantCount: newParticipantCount,
        attendedCount: newAttendedCount,
      });

      toast.success("Peserta berhasil ditambahkan");
      await fetchParticipants();
    } catch (error) {
      console.error("Error adding participant:", error);
      toast.error("Gagal menambahkan peserta");
      throw error;
    }
  };

  const updateParticipantStatus = async (
    participantId: string,
    oldStatus: ParticipantAttendance,
    newStatus: ParticipantAttendance
  ) => {
    if (!eventId) throw new Error("Event ID is required");
    try {
      // Update participant
      await updateDocument(COLLECTIONS.PARTICIPANTS, participantId, {
        attendanceStatus: newStatus,
      });

      // Update event stats if attended status changed
      if (oldStatus !== newStatus && (oldStatus === "attended" || newStatus === "attended")) {
        const event = await getDocument<MarketingEvent>(COLLECTIONS.EVENTS, eventId);
        if (event) {
          let newAttendedCount = event.attendedCount || 0;
          if (oldStatus === "attended" && newStatus !== "attended") newAttendedCount = Math.max(0, newAttendedCount - 1);
          if (oldStatus !== "attended" && newStatus === "attended") newAttendedCount++;

          await updateDocument(COLLECTIONS.EVENTS, eventId, {
            attendedCount: newAttendedCount,
          });
        }
      }

      toast.success("Status peserta diperbarui");
      await fetchParticipants();
    } catch (error) {
      console.error("Error updating participant:", error);
      toast.error("Gagal memperbarui status peserta");
      throw error;
    }
  };

  const removeParticipant = async (participantId: string, status: ParticipantAttendance) => {
    if (!eventId) throw new Error("Event ID is required");
    try {
      await deleteDocument(COLLECTIONS.PARTICIPANTS, participantId);

      // Update event stats
      const event = await getDocument<MarketingEvent>(COLLECTIONS.EVENTS, eventId);
      if (event) {
        const newParticipantCount = Math.max(0, (event.participantCount || 0) - 1);
        let newAttendedCount = event.attendedCount || 0;
        if (status === "attended") {
          newAttendedCount = Math.max(0, newAttendedCount - 1);
        }

        await updateDocument(COLLECTIONS.EVENTS, eventId, {
          participantCount: newParticipantCount,
          attendedCount: newAttendedCount,
        });
      }

      toast.success("Peserta berhasil dihapus");
      await fetchParticipants();
    } catch (error) {
      console.error("Error deleting participant:", error);
      toast.error("Gagal menghapus peserta");
      throw error;
    }
  };

  return {
    participants,
    isLoading,
    fetchParticipants,
    addParticipant,
    updateParticipantStatus,
    removeParticipant,
  };
}
