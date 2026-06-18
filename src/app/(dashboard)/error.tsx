"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Terjadi Kesalahan</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi atau hubungi admin jika masalah berlanjut.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Ke Dashboard
        </Button>
        <Button
          onClick={reset}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25"
        >
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
