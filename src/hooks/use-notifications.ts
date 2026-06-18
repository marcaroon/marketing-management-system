"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDocuments,
  addDocument,
  updateDocument,
  orderBy,
  where,
} from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { Timestamp } from "firebase/firestore";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "follow_up" | "event" | "prospect" | "system";
  read: boolean;
  link?: string;
  createdAt: Timestamp;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getDocuments<Notification>("notifications", [
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
      ]);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDocument("notifications", notificationId, { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) => updateDocument("notifications", n.id, { read: true }))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const createNotification = async (data: {
    userId: string;
    title: string;
    message: string;
    type: Notification["type"];
    link?: string;
  }) => {
    try {
      await addDocument("notifications", {
        ...data,
        read: false,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
  };
}
