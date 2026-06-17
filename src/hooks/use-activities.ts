"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDocuments,
  addDocument,
  orderBy,
  limit as fbLimit,
} from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { Activity, ActivityTargetType } from "@/types";

export function useActivities(limitCount: number = 20) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDocuments<Activity>(COLLECTIONS.ACTIVITIES, [
        orderBy("createdAt", "desc"),
        fbLimit(limitCount),
      ]);
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [limitCount]);

  const logActivity = async (
    userId: string,
    userName: string,
    action: string,
    targetType: ActivityTargetType,
    targetId: string,
    targetName: string,
    description: string
  ) => {
    try {
      await addDocument(COLLECTIONS.ACTIVITIES, {
        userId,
        userName,
        action,
        targetType,
        targetId,
        targetName,
        description,
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    fetchActivities,
    logActivity,
  };
}
