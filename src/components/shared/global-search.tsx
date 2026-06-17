"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useUIStore } from "@/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";

const searchItems = [
  { title: "Dashboard", href: "/dashboard", group: "Halaman" },
  { title: "Prospek", href: "/prospects", group: "Halaman" },
  { title: "Tambah Prospek", href: "/prospects/new", group: "Aksi" },
  { title: "Klien Aktif", href: "/clients", group: "Halaman" },
  { title: "Event Marketing", href: "/events", group: "Halaman" },
  { title: "Buat Event", href: "/events/new", group: "Aksi" },
  { title: "Kalender", href: "/calendar", group: "Halaman" },
  { title: "Tim", href: "/team", group: "Halaman", adminOnly: true },
  { title: "Laporan", href: "/reports", group: "Halaman", adminOnly: true },
  { title: "Pengaturan", href: "/settings", group: "Halaman" },
];

export function GlobalSearch() {
  const { globalSearchOpen, setGlobalSearchOpen } = useUIStore();
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setGlobalSearchOpen(!globalSearchOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [globalSearchOpen, setGlobalSearchOpen]);

  const filteredItems = searchItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const groups = Array.from(new Set(filteredItems.map((item) => item.group)));

  return (
    <CommandDialog open={globalSearchOpen} onOpenChange={setGlobalSearchOpen}>
      <CommandInput placeholder="Cari halaman atau aksi..." />
      <CommandList>
        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group} heading={group}>
            {filteredItems
              .filter((item) => item.group === group)
              .map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => {
                    router.push(item.href);
                    setGlobalSearchOpen(false);
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {item.title}
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
