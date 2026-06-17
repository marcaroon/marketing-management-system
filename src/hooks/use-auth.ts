"use client";

import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const { user, isLoading, isAuthenticated } = useAuthStore();

  const isAdmin = user?.role === "admin";
  const isMarketing = user?.role === "marketing";

  const canEdit = (createdBy: string) => {
    if (isAdmin) return true;
    return user?.uid === createdBy;
  };

  const canDelete = () => isAdmin;

  const canAccessReports = () => isAdmin;

  const canAccessTeam = () => isAdmin;

  const canManageEvent = (createdBy: string) => {
    if (isAdmin) return true;
    return user?.uid === createdBy;
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isMarketing,
    canEdit,
    canDelete,
    canAccessReports,
    canAccessTeam,
    canManageEvent,
  };
}
