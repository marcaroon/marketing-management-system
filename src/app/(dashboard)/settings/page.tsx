"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
import { Building2, Bell, Palette, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan" description="Kelola preferensi akun dan sistem" />

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-blue-600" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Nama</Label>
                <Input value={user?.displayName || ""} disabled className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="mt-1" />
              </div>
              <div>
                <Label>Telepon</Label>
                <Input value={user?.phone || ""} disabled className="mt-1" />
              </div>
              <div>
                <Label>Role</Label>
                <Input value={user?.role === "admin" ? "Admin" : "Marketing"} disabled className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4 text-violet-600" />
              Tampilan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Mode Gelap</p>
                <p className="text-xs text-muted-foreground">
                  Aktifkan tampilan gelap untuk mengurangi cahaya
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-amber-600" />
              Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Reminder Follow Up</p>
                <p className="text-xs text-muted-foreground">
                  Tampilkan reminder untuk follow up yang jatuh tempo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notifikasi Event</p>
                <p className="text-xs text-muted-foreground">
                  Tampilkan notifikasi untuk event yang akan datang
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Role Access (Admin only) */}
        {isAdmin && (
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-emerald-600" />
                Akses Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-accent/50 p-4">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Akses penuh ke semua fitur: prospek, klien, event, tim, laporan, dan pengaturan.
                </p>
              </div>
              <div className="rounded-lg bg-accent/50 p-4">
                <p className="text-sm font-medium">Marketing</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Input dan kelola prospek milik sendiri, lihat klien, kelola event milik sendiri, lihat kalender.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
