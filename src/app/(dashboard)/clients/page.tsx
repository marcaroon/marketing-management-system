"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { useClients } from "@/hooks/use-clients";
import { useAuth } from "@/hooks/use-auth";
import { SERVICE_STATUS_OPTIONS, SERVICE_STATUS_LABELS } from "@/lib/constants";
import { formatTimestamp } from "@/lib/firebase/firestore";
import { exportClientsToPDF, exportClientsToExcel } from "@/lib/export-utils";
import { Client } from "@/types";
import {
  Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, ArrowUpDown,
  Filter, Plus, MoreHorizontal, FileDown, FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientsPage() {
  const { clients, isLoading, removeClient } = useClients();
  const { isAdmin } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    if (statusFilter === "all") return clients;
    return clients.filter((c) => c.serviceStatus === statusFilter);
  }, [clients, statusFilter]);

  const columns: ColumnDef<Client>[] = useMemo(
    () => [
      {
        accessorKey: "companyName",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-3 h-8 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Perusahaan <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <Link href={`/clients/${row.original.id}`}
            className="text-sm font-medium text-foreground hover:text-blue-600 hover:underline">
            {row.getValue("companyName")}
          </Link>
        ),
      },
      {
        accessorKey: "picName",
        header: "PIC",
        cell: ({ row }) => <span className="text-sm">{row.getValue("picName")}</span>,
      },
      {
        accessorKey: "serviceType",
        header: "Jenis Layanan",
        cell: ({ row }) => <span className="text-sm">{row.getValue("serviceType")}</span>,
      },
      {
        accessorKey: "serviceStatus",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("serviceStatus") as string;
          const option = SERVICE_STATUS_OPTIONS.find((o) => o.value === status);
          return (
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", option?.color)}>
              {option?.label || status}
            </span>
          );
        },
      },
      {
        accessorKey: "picInternalName",
        header: "PIC Internal",
        cell: ({ row }) => <span className="text-sm">{row.getValue("picInternalName") || "-"}</span>,
      },
      {
        accessorKey: "projectDeadline",
        header: "Deadline",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatTimestamp(row.original.projectDeadline)}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const client = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/clients/${client.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> Detail
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/clients/${client.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    onClick={() => setDeleteId(client.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [isAdmin]
  );

  const table = useReactTable({
    data: filteredClients,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  const handleDelete = async () => {
    if (deleteId) {
      await removeClient(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Klien Aktif" description="Kelola klien yang sedang dalam pelayanan">
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-800"
        >
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Klien
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari klien..." value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter status">
                {(value: string) => value === "all" ? "Semua Status" : SERVICE_STATUS_LABELS[value as keyof typeof SERVICE_STATUS_LABELS] || value}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {SERVICE_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportClientsToPDF(filteredClients)}>
                <FileDown className="mr-2 h-4 w-4" /> Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportClientsToExcel(filteredClients)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Memuat data..." : "Belum ada data klien aktif."}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan {table.getRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} data
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm text-muted-foreground">
            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Klien?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
