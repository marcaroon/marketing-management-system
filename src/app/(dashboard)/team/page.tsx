"use client";

import { useState, useMemo } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  flexRender, type ColumnDef,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { useTeam } from "@/hooks/use-team";
import { useAuth } from "@/hooks/use-auth";
import { UserProfile } from "@/types";
import { Search, UserPlus, Shield, Mail, Phone } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function TeamPage() {
  const { members, isLoading, updateMember } = useTeam();
  const { isAdmin } = useAuth();
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<UserProfile>[] = useMemo(
    () => [
      {
        accessorKey: "displayName",
        header: "Nama",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-semibold text-white">
              {row.original.displayName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{row.getValue("displayName")}</p>
              <p className="text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Telepon",
        cell: ({ row }) => <span className="text-sm">{row.getValue("phone") || "-"}</span>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant={row.getValue("role") === "admin" ? "default" : "secondary"} className="text-xs">
            <Shield className="mr-1 h-3 w-3" />
            {row.getValue("role") === "admin" ? "Admin" : "Marketing"}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.getValue("status") === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}>
            {row.getValue("status") === "active" ? "Aktif" : "Nonaktif"}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          if (!isAdmin) return null;
          const member = row.original;
          return (
            <Select
              value={member.status}
              onValueChange={(value) => { if (value) updateMember(member.uid, { status: value as any }) }}
            >
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue>{(value: string) => value === "active" ? "Aktifkan" : "Nonaktifkan"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktifkan</SelectItem>
                <SelectItem value="inactive">Nonaktifkan</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
    ],
    [isAdmin, updateMember]
  );

  const table = useReactTable({
    data: members,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!isAdmin) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tim" description="Kelola anggota tim marketing" />

      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari anggota..." value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
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
                  <p className="text-sm text-muted-foreground">{isLoading ? "Memuat..." : "Belum ada anggota tim."}</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
