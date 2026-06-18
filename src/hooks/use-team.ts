"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDocuments,
  updateDocument,
  orderBy,
} from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { UserProfile } from "@/types";
import { toast } from "sonner";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Firebase config for the secondary app used to create users without
// logging out the current admin session.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

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

  /**
   * Create a new team member using a secondary Firebase app instance.
   * This prevents the admin from being logged out when creating a new user.
   */
  const addMember = async (data: {
    email: string;
    password: string;
    displayName: string;
    phone: string;
    role: "admin" | "marketing";
  }) => {
    // Create a temporary secondary Firebase app to avoid affecting the
    // current admin's auth session.
    const secondaryApp = initializeApp(firebaseConfig, "secondary-auth");
    const secondaryAuth = getAuth(secondaryApp);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        data.email,
        data.password
      );
      const uid = userCredential.user.uid;

      // Write the profile document using the primary Firestore instance
      await setDoc(doc(db, COLLECTIONS.USERS, uid), {
        uid,
        email: data.email,
        displayName: data.displayName,
        phone: data.phone,
        role: data.role,
        status: "active",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      toast.success(`Anggota ${data.displayName} berhasil ditambahkan`);
      await fetchMembers();
      return uid;
    } catch (error: any) {
      console.error("Error adding member:", error);
      if (error?.code === "auth/email-already-in-use") {
        toast.error("Email sudah digunakan oleh akun lain");
      } else if (error?.code === "auth/weak-password") {
        toast.error("Password terlalu lemah (minimal 6 karakter)");
      } else if (error?.code === "auth/invalid-email") {
        toast.error("Format email tidak valid");
      } else {
        toast.error("Gagal menambahkan anggota tim");
      }
      throw error;
    } finally {
      // Always clean up the secondary app
      await deleteApp(secondaryApp);
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
    addMember,
  };
}
