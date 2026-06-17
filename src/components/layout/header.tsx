"use client";

import { Search, Moon, Sun, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/firebase/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { theme, toggleTheme, setGlobalSearchOpen } = useUIStore();
  const { setCollapsed, isCollapsed } = useSidebarStore();
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="hidden items-center gap-2 rounded-lg border border-border bg-accent/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent sm:flex"
        >
          <Search className="h-4 w-4" />
          <span>Cari...</span>
          <kbd className="pointer-events-none ml-6 hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <Moon className="h-[18px] w-[18px]" />
              ) : (
                <Sun className="h-[18px] w-[18px]" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {theme === "light" ? "Mode gelap" : "Mode terang"}
          </TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifikasi</TooltipContent>
        </Tooltip>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-[10px] font-semibold text-white">
                  {user ? getInitials(user.displayName) : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">
                {user?.displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm">{user?.displayName}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => (window.location.href = "/settings")}>
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-red-600 focus:text-red-600"
            >
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
