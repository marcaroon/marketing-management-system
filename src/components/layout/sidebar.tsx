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
  ChevronLeft,
  LogOut,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  UserSearch,
  Building2,
  CalendarCheck,
  Calendar,
  Users,
  BarChart3,
  Settings,
};

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["admin", "marketing"] },
  { title: "Prospek", href: "/prospects", icon: "UserSearch", roles: ["admin", "marketing"] },
  { title: "Klien Aktif", href: "/clients", icon: "Building2", roles: ["admin", "marketing"] },
  { title: "Event Marketing", href: "/events", icon: "CalendarCheck", roles: ["admin", "marketing"] },
  { title: "Kalender", href: "/calendar", icon: "Calendar", roles: ["admin", "marketing"] },
  { title: "Tim", href: "/team", icon: "Users", roles: ["admin"] },
  { title: "Laporan", href: "/reports", icon: "BarChart3", roles: ["admin"] },
  { title: "Pengaturan", href: "/settings", icon: "Settings", roles: ["admin", "marketing"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed, setCollapsed } = useSidebarStore();

  const filteredMenu = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md">
              <span className="text-sm font-bold text-white">TQ</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Marketing</span>
              <span className="text-[10px] text-muted-foreground">Management System</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md">
            <span className="text-sm font-bold text-white">TQ</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-3">
          {filteredMenu.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/50 dark:text-blue-400"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  isCollapsed && "justify-center px-2"
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
                {!isCollapsed && <span>{item.title}</span>}
                {isActive && !isCollapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-3">
        {!isCollapsed && user && (
          <div className="mb-3 rounded-lg bg-accent/50 px-3 py-2">
            <p className="text-xs font-medium text-foreground truncate">{user.displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {user.role === "admin" ? "Admin" : "Marketing"}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? "right" : "top"}>Keluar</TooltipContent>
          </Tooltip>

          {!isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setCollapsed(true)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Perkecil sidebar</TooltipContent>
            </Tooltip>
          )}

          {isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setCollapsed(false)}
                >
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Perbesar sidebar</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </aside>
  );
}
