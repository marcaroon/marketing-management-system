"use client";

import { useState, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ClientTimelineEntry } from "@/types";
import { toast } from "sonner";

export function useClientTimeline(clientId?: string) {
  const [timeline, setTimeline] = useState<ClientTimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    if (!clientId) return;
    setIsLoading(true);
    try {
      const colRef = collection(db, "clients", clientId, "timeline");
      const q = query(colRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        (d) => ({ id: d.id, clientId, ...d.data() }) as ClientTimelineEntry
      );
      setTimeline(data);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      toast.error("Gagal memuat timeline klien");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  const addTimelineEntry = async (
    action: string,
    description: string,
    userId: string,
    userName: string
  ) => {
    if (!clientId) throw new Error("Client ID is required");
    try {
      const colRef = collection(db, "clients", clientId, "timeline");
      await addDoc(colRef, {
        clientId,
        action,
        description,
        userId,
        userName,
        createdAt: serverTimestamp(),
      });
      toast.success("Timeline ditambahkan");
      await fetchTimeline();
    } catch (error) {
      console.error("Error adding timeline entry:", error);
      toast.error("Gagal menambahkan timeline");
      throw error;
    }
  };

  return {
    timeline,
    isLoading,
    fetchTimeline,
    addTimelineEntry,
  };
}
