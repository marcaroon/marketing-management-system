"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  orderBy,
} from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { Client } from "@/types";
import { toast } from "sonner";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDocuments<Client>(COLLECTIONS.CLIENTS, [
        orderBy("createdAt", "desc"),
      ]);
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Gagal memuat data klien");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addClient = async (data: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addDocument(COLLECTIONS.CLIENTS, data);
      toast.success("Klien berhasil ditambahkan");
      await fetchClients();
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Gagal menambahkan klien");
      throw error;
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    try {
      await updateDocument(COLLECTIONS.CLIENTS, id, data);
      toast.success("Klien berhasil diperbarui");
      await fetchClients();
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Gagal memperbarui klien");
      throw error;
    }
  };

  const removeClient = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.CLIENTS, id);
      toast.success("Klien berhasil dihapus");
      await fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Gagal menghapus klien");
      throw error;
    }
  };

  const getClient = async (id: string) => {
    try {
      return await getDocument<Client>(COLLECTIONS.CLIENTS, id);
    } catch (error) {
      console.error("Error getting client:", error);
      toast.error("Gagal memuat data klien");
      return null;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    isLoading,
    fetchClients,
    addClient,
    updateClient,
    removeClient,
    getClient,
  };
}
