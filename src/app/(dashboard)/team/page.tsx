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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { useTeam } from "@/hooks/use-team";
import { useAuth } from "@/hooks/use-auth";
import { UserProfile } from "@/types";
import { Search, UserPlus, Shield, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function TeamPage() {
  const { members, isLoading, updateMember, addMember } = useTeam();
  const { isAdmin } = useAuth();
  const [globalFilter, setGlobalFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({
    displayName: "",
    email: "",
    password: "",
    phone: "",
    role: "marketing" as "admin" | "marketing",
  });

  const resetForm = () => {
    setNewMember({ displayName: "", email: "", password: "", phone: "", role: "marketing" });
  };

  const handleAddMember = async () => {
    if (!newMember.displayName.trim() || !newMember.email.trim() || !newMember.password) return;
    setIsSubmitting(true);
    try {
      await addMember(newMember);
      setIsAddDialogOpen(false);
      resetForm();
    } catch {
      // Error already handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

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
    initialState: {
      pagination: { pageSize: 10 },
    },
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

      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari anggota..." value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-800"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Anggota
        </Button>
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

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Anggota Baru</DialogTitle>
            <DialogDescription>Buat akun baru untuk anggota tim marketing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Nama Lengkap *</Label>
              <Input
                value={newMember.displayName}
                onChange={(e) => setNewMember((p) => ({ ...p, displayName: e.target.value }))}
                placeholder="Nama lengkap"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@perusahaan.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={newMember.password}
                onChange={(e) => setNewMember((p) => ({ ...p, password: e.target.value }))}
                placeholder="Minimal 6 karakter"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Telepon</Label>
              <Input
                value={newMember.phone}
                onChange={(e) => setNewMember((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Nomor telepon"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Role *</Label>
              <Select
                value={newMember.role}
                onValueChange={(value) => { if (value) setNewMember((p) => ({ ...p, role: value as any })); }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue>{(value: string) => value === "admin" ? "Admin" : "Marketing"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }} disabled={isSubmitting}>
                Batal
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={isSubmitting || !newMember.displayName.trim() || !newMember.email.trim() || !newMember.password}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Membuat...</>
                ) : (
                  <><UserPlus className="mr-2 h-4 w-4" />Tambah</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
