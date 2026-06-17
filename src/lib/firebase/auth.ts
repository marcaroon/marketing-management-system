"use client";

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";
import { UserProfile } from "@/types";
import { COLLECTIONS } from "@/lib/constants";

export async function signIn(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string };
    let message = "Terjadi kesalahan saat login.";
    switch (firebaseError.code) {
      case "auth/user-not-found":
        message = "Email tidak ditemukan.";
        break;
      case "auth/wrong-password":
        message = "Password salah.";
        break;
      case "auth/invalid-email":
        message = "Format email tidak valid.";
        break;
      case "auth/user-disabled":
        message = "Akun telah dinonaktifkan.";
        break;
      case "auth/too-many-requests":
        message = "Terlalu banyak percobaan. Coba lagi nanti.";
        break;
      case "auth/invalid-credential":
        message = "Email atau password salah.";
        break;
    }
    return { user: null, error: message };
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch {
    return { error: "Gagal logout." };
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch {
    return null;
  }
}
