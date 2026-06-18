import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
        <FileQuestion className="h-8 w-8 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Halaman Tidak Ditemukan</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/dashboard">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
}
