"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthChange, getUserProfile } from "@/lib/firebase/auth";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile && profile.status === "active") {
          setUser(profile);
          if (pathname === "/login") {
            router.replace("/dashboard");
          }
        } else {
          // User exists in Firebase Auth but not in Firestore or is inactive
          setUser(null);
          if (pathname !== "/login") {
            router.replace("/login");
          }
        }
      } else {
        setUser(null);
        if (pathname !== "/login") {
          router.replace("/login");
        }
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading, router, pathname]);

  return <>{children}</>;
}
