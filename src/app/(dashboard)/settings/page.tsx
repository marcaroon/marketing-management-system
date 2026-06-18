"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
import { updateDocument } from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { toast } from "sonner";
import { Building2, Bell, Palette, Shield, Lock, Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useUIStore();

  // Profile editing
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || "",
    phone: user?.phone || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState({
    followUpReminder: true,
    eventNotification: true,
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setProfileDirty(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!profileForm.displayName.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateDocument(COLLECTIONS.USERS, user.uid, {
        displayName: profileForm.displayName.trim(),
        phone: profileForm.phone.trim(),
      });
      toast.success("Profil berhasil diperbarui");
      setProfileDirty(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Semua field password wajib diisi");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }

    setIsChangingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        toast.error("Sesi login tidak valid");
        return;
      }

      // Re-authenticate first
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordForm.newPassword);

      toast.success("Password berhasil diubah");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error?.code === "auth/wrong-password" || error?.code === "auth/invalid-credential") {
        toast.error("Password saat ini salah");
      } else if (error?.code === "auth/weak-password") {
        toast.error("Password baru terlalu lemah");
      } else {
        toast.error("Gagal mengubah password");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

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
                <Input
                  value={profileForm.displayName}
                  onChange={(e) => handleProfileChange("displayName", e.target.value)}
                  className="mt-1"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Email tidak dapat diubah</p>
              </div>
              <div>
                <Label>Telepon</Label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  className="mt-1"
                  placeholder="Nomor telepon"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Input value={user?.role === "admin" ? "Admin" : "Marketing"} disabled className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Role diatur oleh admin</p>
              </div>
            </div>
            {profileDirty && (
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-800"
                >
                  {isSavingProfile ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" />Simpan Profil</>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4 text-rose-600" />
              Ubah Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Password Saat Ini</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="mt-1"
                placeholder="Masukkan password saat ini"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Password Baru</Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="mt-1"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div>
                <Label>Konfirmasi Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="mt-1"
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                variant="outline"
              >
                {isChangingPassword ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengubah...</>
                ) : (
                  "Ubah Password"
                )}
              </Button>
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
              <Switch
                checked={notifications.followUpReminder}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, followUpReminder: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notifikasi Event</p>
                <p className="text-xs text-muted-foreground">
                  Tampilkan notifikasi untuk event yang akan datang
                </p>
              </div>
              <Switch
                checked={notifications.eventNotification}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, eventNotification: checked }))
                }
              />
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
