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
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge, PriorityBadge } from "./status-badge";
import { Prospect } from "@/types";
import { PROSPECT_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS, PROSPECT_STATUS_LABELS, LEAD_SOURCE_LABELS } from "@/lib/constants";
import { formatTimestamp } from "@/lib/firebase/firestore";
import { exportProspectsToPDF, exportProspectsToExcel } from "@/lib/export-utils";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";

interface ProspectTableProps {
  prospects: Prospect[];
  onDelete?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function ProspectTable({
  prospects,
  onDelete,
  isLoading = false,
}: ProspectTableProps) {
  const { user, isAdmin, canEdit, canDelete } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filteredProspects = useMemo(() => {
    let filtered = prospects;
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    if (sourceFilter !== "all") {
      filtered = filtered.filter((p) => p.leadSource === sourceFilter);
    }
    return filtered;
  }, [prospects, statusFilter, sourceFilter]);

  const columns: ColumnDef<Prospect>[] = useMemo(
    () => [
      {
        accessorKey: "companyName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Perusahaan
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <Link
              href={`/prospects/${row.original.id}`}
              className="text-sm font-medium text-foreground hover:text-blue-600 hover:underline"
            >
              {row.getValue("companyName")}
            </Link>
            <p className="text-xs text-muted-foreground">{row.original.city}</p>
          </div>
        ),
      },
      {
        accessorKey: "picName",
        header: "PIC",
        cell: ({ row }) => (
          <div>
            <p className="text-sm">{row.getValue("picName")}</p>
            <p className="text-xs text-muted-foreground">{row.original.picPhone}</p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
      },
      {
        accessorKey: "priority",
        header: "Prioritas",
        cell: ({ row }) => <PriorityBadge priority={row.getValue("priority")} />,
      },
      {
        accessorKey: "ccdName",
        header: "CCD",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("ccdName") || "-"}</span>
        ),
      },
      {
        accessorKey: "leadSource",
        header: "Sumber",
        cell: ({ row }) => {
          const source = LEAD_SOURCE_OPTIONS.find(
            (o) => o.value === row.getValue("leadSource")
          );
          return <span className="text-sm">{source?.label || "-"}</span>;
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatTimestamp(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const prospect = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/prospects/${prospect.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Link>
                </DropdownMenuItem>
                {canEdit(prospect.createdBy) && (
                  <DropdownMenuItem asChild>
                    <Link href={`/prospects/${prospect.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                )}
                {canDelete() && (
                  <DropdownMenuItem
                    onClick={() => setDeleteId(prospect.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [canEdit, canDelete]
  );

  const table = useReactTable({
    data: filteredProspects,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 15 },
    },
  });

  const handleDelete = async () => {
    if (deleteId && onDelete) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari perusahaan, PIC..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter status">{(value: string) => value === "all" ? "Semua Status" : PROSPECT_STATUS_LABELS[value as keyof typeof PROSPECT_STATUS_LABELS] || value}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {PROSPECT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v || "all")}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Sumber lead">{(value: string) => value === "all" ? "Semua Sumber" : LEAD_SOURCE_LABELS[value as keyof typeof LEAD_SOURCE_LABELS] || value}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sumber</SelectItem>
              {LEAD_SOURCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
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
              <DropdownMenuItem onClick={() => exportProspectsToPDF(filteredProspects)}>
                <FileDown className="mr-2 h-4 w-4" /> Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportProspectsToExcel(filteredProspects)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="transition-colors">
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
                    {isLoading ? "Memuat data..." : "Belum ada data prospek."}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan {table.getRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} data
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Prospek?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data prospek akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
