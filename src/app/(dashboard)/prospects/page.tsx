"use client";

import Link from "next/link";
import { Plus, Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ProspectTable } from "@/components/prospects/prospect-table";
import { useProspects } from "@/hooks/use-prospects";
import { exportProspectsToPDF, exportProspectsToExcel } from "@/lib/export-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProspectsPage() {
  const { prospects, isLoading, removeProspect } = useProspects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospek"
        description="Kelola data prospek perusahaan konsultan"
      >
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={prospects.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportProspectsToPDF(prospects)}>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportProspectsToExcel(prospects)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-800"
          >
            <Link href="/prospects/new">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Prospek
            </Link>
          </Button>
        </div>
      </PageHeader>

      <ProspectTable
        prospects={prospects}
        onDelete={removeProspect}
        isLoading={isLoading}
      />
    </div>
  );
}
