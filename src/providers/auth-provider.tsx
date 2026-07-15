"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthChange, getOrCreateUserProfile } from "@/lib/firebase/auth";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  // Keep ref in sync without triggering effect re-runs
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      console.log(
        "[AUTH] Auth state change:",
        firebaseUser?.email || "logged out",
      );

      if (firebaseUser) {
        const profile = await getOrCreateUserProfile(firebaseUser);
        console.log("[AUTH] Profile result:", profile);

        if (profile && profile.status === "active") {
          setUser(profile);
          if (pathnameRef.current === "/login") {
            console.log("[AUTH] Redirecting to dashboard");
            router.replace("/dashboard");
          }
        } else {
          console.log(
            "[AUTH] Profile invalid or inactive, redirecting to login",
          );
          setUser(null);
          if (pathnameRef.current !== "/login") {
            router.replace("/login");
          }
        }
      } else {
        console.log("[AUTH] No firebase user, redirecting to login");
        setUser(null);
        if (pathnameRef.current !== "/login") {
          router.replace("/login");
        }
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading, router]);

  return <>{children}</>;
}
