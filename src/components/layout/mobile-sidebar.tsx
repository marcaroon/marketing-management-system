"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserSearch,
  Building2,
  CalendarCheck,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  X,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useSidebarStore } from "@/stores/sidebar-store";
import { signOut } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  UserSearch,
  Building2,
  CalendarCheck,
  Calendar,
  Users,
  BarChart3,
  Settings,
  TrendingUp,
};

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["admin", "marketing"] },
  { title: "Prospek", href: "/prospects", icon: "UserSearch", roles: ["admin", "marketing"] },
  { title: "Klien Aktif", href: "/clients", icon: "Building2", roles: ["admin", "marketing"] },
  { title: "Event Marketing", href: "/events", icon: "CalendarCheck", roles: ["admin", "marketing"] },
  { title: "Kalender", href: "/calendar", icon: "Calendar", roles: ["admin", "marketing"] },
  { title: "KPI", href: "/kpi", icon: "TrendingUp", roles: ["admin", "marketing"] },
  { title: "Tim", href: "/team", icon: "Users", roles: ["admin"] },
  { title: "Laporan", href: "/reports", icon: "BarChart3", roles: ["admin"] },
  { title: "Pengaturan", href: "/settings", icon: "Settings", roles: ["admin", "marketing"] },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredMenu = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-foreground">Marketing</span>
              <span className="text-[10px] text-muted-foreground">Management System</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-3">
            {filteredMenu.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/50 dark:text-blue-400"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.title}</span>
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border p-3">
          {user && (
            <div className="mb-3 rounded-lg bg-accent/50 px-3 py-2">
              <p className="text-xs font-medium text-foreground truncate">{user.displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {user.role === "admin" ? "Admin" : "Marketing"}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
