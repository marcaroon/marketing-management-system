"use client";

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  getDocuments,
  where,
  orderBy,
} from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { KpiYear, KpiCcoTarget, KpiDistributionMode, KpiRealization, Prospect, UserProfile } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const KPI_COLLECTION = COLLECTIONS.KPI;

// ─── helpers ────────────────────────────────────────────────────────────────

/** Format "YYYY-MM" from year + 0-based month index */
export function formatMonthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

/** Parse "YYYY-MM" → { year, monthIndex } */
export function parseMonthKey(key: string): { year: number; monthIndex: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, monthIndex: m - 1 };
}

/** Format Rupiah */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Indonesian month names (0-indexed) */
export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// ─── hook ───────────────────────────────────────────────────────────────────

export function useKpi(year: number) {
  const [kpiYear, setKpiYear] = useState<KpiYear | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realization, setRealization] = useState<Record<string, KpiRealization>>({});
  const { user } = useAuthStore();

  // ── fetch KPI document ───────────────────────────────────────────────────
  const fetchKpi = useCallback(async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, KPI_COLLECTION, String(year));
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setKpiYear({ id: snap.id, ...snap.data() } as KpiYear);
      } else {
        setKpiYear(null);
      }
    } catch (error) {
      console.error("Error fetching KPI:", error);
      toast.error("Gagal memuat data KPI");
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  // ── compute realization from closing prospects ───────────────────────────
  const fetchRealization = useCallback(async (marketingMembers: UserProfile[]) => {
    try {
      const data = await getDocuments<Prospect>(COLLECTIONS.PROSPECTS, [
        where("status", "==", "closing"),
        orderBy("updatedAt", "desc"),
      ]);

      // Filter only prospects updated in this year that have a contractValue
      const realized = data.filter((p) => {
        if (!p.contractValue || p.contractValue <= 0) return false;
        if (!p.updatedAt) return false;
        return p.updatedAt.toDate().getFullYear() === year;
      });

      // Build per-CCO realization
      const result: Record<string, KpiRealization> = {};

      // Initialize all marketing members with zero
      marketingMembers.forEach((m) => {
        result[m.uid] = {
          ccoId: m.uid,
          ccoName: m.displayName,
          annualActual: 0,
          monthlyActual: {},
        };
      });

      realized.forEach((p) => {
        const ccoId = p.ccdId;
        if (!ccoId) return;
        const value = p.contractValue!;
        const month = formatMonthKey(year, p.updatedAt.toDate().getMonth());

        if (!result[ccoId]) {
          result[ccoId] = {
            ccoId,
            ccoName: p.ccdName || ccoId,
            annualActual: 0,
            monthlyActual: {},
          };
        }
        result[ccoId].annualActual += value;
        result[ccoId].monthlyActual[month] = (result[ccoId].monthlyActual[month] || 0) + value;
      });

      setRealization(result);
    } catch (error) {
      console.error("Error fetching realization:", error);
    }
  }, [year]);

  // ── initialize year document (first setup) ───────────────────────────────
  const initializeYear = async (
    annualTarget: number,
    marketingMembers: UserProfile[],
    mode: KpiDistributionMode = "top_down"
  ) => {
    if (!user) return;
    try {
      const perCco = marketingMembers.length > 0 ? annualTarget / marketingMembers.length : 0;
      const ccoTargets: Record<string, KpiCcoTarget> = {};
      marketingMembers.forEach((m) => {
        ccoTargets[m.uid] = {
          ccoId: m.uid,
          ccoName: m.displayName,
          annualTarget: perCco,
          monthlyOverrides: {},
        };
      });

      const docRef = doc(db, KPI_COLLECTION, String(year));
      await setDoc(docRef, {
        year,
        annualTarget,
        distributionMode: mode,
        ccoTargets,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success(`Target KPI ${year} berhasil dibuat`);
      await fetchKpi();
    } catch (error) {
      console.error("Error initializing KPI:", error);
      toast.error("Gagal membuat target KPI");
      throw error;
    }
  };

  // ── update annual target (top-down: redistributes per-CCO automatically) ─
  const updateAnnualTarget = async (
    annualTarget: number,
    marketingMembers: UserProfile[],
    mode: KpiDistributionMode
  ) => {
    if (!user || !kpiYear) return;
    try {
      const docRef = doc(db, KPI_COLLECTION, String(year));

      let ccoTargets = { ...kpiYear.ccoTargets };

      if (mode === "top_down") {
        // Recalculate per-CCO as equal share
        const perCco = marketingMembers.length > 0 ? annualTarget / marketingMembers.length : 0;
        const newCcoTargets: Record<string, KpiCcoTarget> = {};
        marketingMembers.forEach((m) => {
          newCcoTargets[m.uid] = {
            ccoId: m.uid,
            ccoName: m.displayName,
            annualTarget: perCco,
            monthlyOverrides: ccoTargets[m.uid]?.monthlyOverrides || {},
          };
        });
        ccoTargets = newCcoTargets;
      } else {
        // bottom_up: ensure all members have entries, don't touch existing targets
        marketingMembers.forEach((m) => {
          if (!ccoTargets[m.uid]) {
            ccoTargets[m.uid] = {
              ccoId: m.uid,
              ccoName: m.displayName,
              annualTarget: 0,
              monthlyOverrides: {},
            };
          }
        });
      }

      await setDoc(
        docRef,
        {
          annualTarget,
          distributionMode: mode,
          ccoTargets,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success("Target tahunan berhasil diperbarui");
      await fetchKpi();
    } catch (error) {
      console.error("Error updating annual target:", error);
      toast.error("Gagal memperbarui target tahunan");
      throw error;
    }
  };

  // ── update individual CCO annual target (bottom_up adjusts grand total) ──
  const updateCcoTarget = async (
    ccoId: string,
    newAnnualTarget: number,
    monthlyOverrides?: Record<string, number>
  ) => {
    if (!user || !kpiYear) return;
    try {
      const docRef = doc(db, KPI_COLLECTION, String(year));

      const updatedCcoTargets = {
        ...kpiYear.ccoTargets,
        [ccoId]: {
          ...kpiYear.ccoTargets[ccoId],
          annualTarget: newAnnualTarget,
          monthlyOverrides:
            monthlyOverrides ?? kpiYear.ccoTargets[ccoId]?.monthlyOverrides ?? {},
        },
      };

      // In bottom_up mode: grand total = sum of all CCO targets
      let newAnnualGrandTotal = kpiYear.annualTarget;
      if (kpiYear.distributionMode === "bottom_up") {
        newAnnualGrandTotal = Object.values(updatedCcoTargets).reduce(
          (sum, t) => sum + t.annualTarget,
          0
        );
      }

      await setDoc(
        docRef,
        {
          annualTarget: newAnnualGrandTotal,
          ccoTargets: updatedCcoTargets,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success("Target CCO berhasil diperbarui");
      await fetchKpi();
    } catch (error) {
      console.error("Error updating CCO target:", error);
      toast.error("Gagal memperbarui target CCO");
      throw error;
    }
  };

  // ── update individual monthly override for a CCO ─────────────────────────
  const updateCcoMonthlyOverride = async (
    ccoId: string,
    monthKey: string, // "YYYY-MM"
    value: number | null // null = remove override (revert to annual/12)
  ) => {
    if (!user || !kpiYear) return;
    try {
      const docRef = doc(db, KPI_COLLECTION, String(year));
      const existing = kpiYear.ccoTargets[ccoId];
      if (!existing) return;

      const monthlyOverrides = { ...existing.monthlyOverrides };
      if (value === null) {
        delete monthlyOverrides[monthKey];
      } else {
        monthlyOverrides[monthKey] = value;
      }

      await setDoc(
        docRef,
        {
          ccoTargets: {
            ...kpiYear.ccoTargets,
            [ccoId]: { ...existing, monthlyOverrides },
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await fetchKpi();
    } catch (error) {
      console.error("Error updating monthly override:", error);
      toast.error("Gagal memperbarui target bulanan");
      throw error;
    }
  };

  // ── switch distribution mode ──────────────────────────────────────────────
  const switchDistributionMode = async (
    mode: KpiDistributionMode,
    marketingMembers: UserProfile[]
  ) => {
    if (!user || !kpiYear) return;
    try {
      const docRef = doc(db, KPI_COLLECTION, String(year));

      let annualTarget = kpiYear.annualTarget;
      let ccoTargets = { ...kpiYear.ccoTargets };

      if (mode === "top_down") {
        // Redistribute equally from existing grand total
        const perCco =
          marketingMembers.length > 0 ? annualTarget / marketingMembers.length : 0;
        marketingMembers.forEach((m) => {
          ccoTargets[m.uid] = {
            ...(ccoTargets[m.uid] || {}),
            ccoId: m.uid,
            ccoName: m.displayName,
            annualTarget: perCco,
          };
        });
      } else {
        // bottom_up: grand total becomes sum of current CCO targets
        annualTarget = Object.values(ccoTargets).reduce((s, t) => s + t.annualTarget, 0);
      }

      await setDoc(
        docRef,
        { distributionMode: mode, annualTarget, ccoTargets, updatedAt: serverTimestamp() },
        { merge: true }
      );

      toast.success(
        mode === "top_down"
          ? "Mode diubah ke Top-Down — target per CCO direset merata"
          : "Mode diubah ke Bottom-Up — total mengikuti jumlah target CCO"
      );
      await fetchKpi();
    } catch (error) {
      console.error("Error switching mode:", error);
      toast.error("Gagal mengubah mode distribusi");
      throw error;
    }
  };

  // ── derived: get monthly target for a CCO in a given month ───────────────
  const getCcoMonthlyTarget = (ccoId: string, monthKey: string): number => {
    const cco = kpiYear?.ccoTargets[ccoId];
    if (!cco) return 0;
    if (cco.monthlyOverrides[monthKey] !== undefined) {
      return cco.monthlyOverrides[monthKey];
    }
    return cco.annualTarget / 12;
  };

  // ── derived: get monthly target for entire company ────────────────────────
  const getCompanyMonthlyTarget = (monthKey: string): number => {
    if (!kpiYear) return 0;
    return Object.keys(kpiYear.ccoTargets).reduce(
      (sum, ccoId) => sum + getCcoMonthlyTarget(ccoId, monthKey),
      0
    );
  };

  useEffect(() => {
    fetchKpi();
  }, [fetchKpi]);

  return {
    kpiYear,
    isLoading,
    realization,
    fetchKpi,
    fetchRealization,
    initializeYear,
    updateAnnualTarget,
    updateCcoTarget,
    updateCcoMonthlyOverride,
    switchDistributionMode,
    getCcoMonthlyTarget,
    getCompanyMonthlyTarget,
  };
}
