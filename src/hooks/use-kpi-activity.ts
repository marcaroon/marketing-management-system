"use client";

import { useState, useEffect, useCallback } from "react";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/constants";
import {
    KpiActivityYear,
    KpiActivityCco,
    KpiActivityMetrics,
    KpiActivityEffectiveness,
    SsTsMetric,
    UserProfile,
} from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { formatMonthKey } from "@/hooks/use-kpi";

// ─── defaults ────────────────────────────────────────────────────────────────

/** Nilai awal SS/TS kosong untuk satu metrik */
function emptyMetric(): SsTsMetric {
    return { ss: 0, ts: 0 };
}

/** Nilai awal semua metrik aktivitas untuk satu CCO dalam satu bulan */
export function emptyMonthlyMetrics(): KpiActivityMetrics {
    return {
        closingSign: emptyMetric(),
        nkMeet: emptyMetric(),
        eventInvited: emptyMetric(),
        eventConfirmed: emptyMetric(),
        eventAttended: emptyMetric(),
        eventFormFilled: emptyMetric(),
    };
}

// ─── computed helpers ─────────────────────────────────────────────────────────

/** Hitung total (SS + TS) dari satu metrik */
export function metricTotal(m: SsTsMetric): number {
    return (m?.ss ?? 0) + (m?.ts ?? 0);
}

/**
 * Hitung efektivitas dari sekumpulan metrik aktivitas.
 * Semua nilai dalam range 0–1 (persentase).
 */
export function computeEffectiveness(
    metrics: KpiActivityMetrics
): KpiActivityEffectiveness {
    const invited = metricTotal(metrics.eventInvited);
    const confirmed = metricTotal(metrics.eventConfirmed);
    const attended = metricTotal(metrics.eventAttended);
    const formFilled = metricTotal(metrics.eventFormFilled);
    const closing = metricTotal(metrics.closingSign);
    const nkMeet = metricTotal(metrics.nkMeet);

    return {
        invitationEffectiveness: invited > 0 ? attended / invited : 0,
        attendanceRate: confirmed > 0 ? attended / confirmed : 0,
        formFillRate: attended > 0 ? formFilled / attended : 0,
        closingRate: nkMeet > 0 ? closing / nkMeet : 0,
    };
}

/**
 * Jumlahkan dua KpiActivityMetrics (SS & TS masing-masing dijumlah).
 * Berguna untuk menghitung total tahunan dari semua bulan.
 */
export function sumMetrics(
    a: KpiActivityMetrics,
    b: KpiActivityMetrics
): KpiActivityMetrics {
    const add = (x: SsTsMetric, y: SsTsMetric): SsTsMetric => ({
        ss: (x?.ss ?? 0) + (y?.ss ?? 0),
        ts: (x?.ts ?? 0) + (y?.ts ?? 0),
    });
    return {
        closingSign: add(a.closingSign, b.closingSign),
        nkMeet: add(a.nkMeet, b.nkMeet),
        eventInvited: add(a.eventInvited, b.eventInvited),
        eventConfirmed: add(a.eventConfirmed, b.eventConfirmed),
        eventAttended: add(a.eventAttended, b.eventAttended),
        eventFormFilled: add(a.eventFormFilled, b.eventFormFilled),
    };
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useKpiActivity(year: number) {
    const [activityYear, setActivityYear] = useState<KpiActivityYear | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();

    const docRef = doc(db, COLLECTIONS.KPI_ACTIVITY, String(year));

    // ── fetch ─────────────────────────────────────────────────────────────────
    const fetchKpiActivity = useCallback(async () => {
        setIsLoading(true);
        try {
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setActivityYear({ id: snap.id, ...snap.data() } as KpiActivityYear);
            } else {
                setActivityYear(null);
            }
        } catch (error) {
            console.error("Error fetching KPI Activity:", error);
            toast.error("Gagal memuat data KPI Aktivitas");
        } finally {
            setIsLoading(false);
        }
    }, [year]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── initialize year document ──────────────────────────────────────────────
    const initializeActivityYear = async (marketingMembers: UserProfile[]) => {
        if (!user) return;
        try {
            const ccoData: Record<string, KpiActivityCco> = {};
            marketingMembers.forEach((m) => {
                ccoData[m.uid] = {
                    ccoId: m.uid,
                    ccoName: m.displayName,
                    monthly: {},
                };
            });

            await setDoc(docRef, {
                year,
                ccoData,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            toast.success(`Data KPI Aktivitas ${year} berhasil dibuat`);
            await fetchKpiActivity();
        } catch (error) {
            console.error("Error initializing KPI Activity:", error);
            toast.error("Gagal membuat data KPI Aktivitas");
            throw error;
        }
    };

    /**
     * Update metrik aktivitas satu CCO untuk satu bulan.
     * Melakukan merge sehingga bulan-bulan lain tidak tersentuh.
     */
    const updateCcoMonthlyActivity = async (
        ccoId: string,
        monthKey: string,
        metrics: KpiActivityMetrics
    ) => {
        if (!user || !activityYear) return;
        try {
            const existingCco = activityYear.ccoData[ccoId];
            if (!existingCco) {
                toast.error("Data CCO tidak ditemukan");
                return;
            }

            const updatedCcoData: Record<string, KpiActivityCco> = {
                ...activityYear.ccoData,
                [ccoId]: {
                    ...existingCco,
                    monthly: {
                        ...existingCco.monthly,
                        [monthKey]: metrics,
                    },
                },
            };

            await setDoc(
                docRef,
                {
                    ccoData: updatedCcoData,
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            toast.success("Data aktivitas berhasil disimpan");
            await fetchKpiActivity();
        } catch (error) {
            console.error("Error updating CCO monthly activity:", error);
            toast.error("Gagal menyimpan data aktivitas");
            throw error;
        }
    };

    // ── computed: total tahunan metrik satu CCO ───────────────────────────────
    const getCcoAnnualMetrics = useCallback(
        (ccoId: string): KpiActivityMetrics => {
            const cco = activityYear?.ccoData[ccoId];
            if (!cco) return emptyMonthlyMetrics();

            return Object.values(cco.monthly).reduce(
                (acc, monthMetrics) => sumMetrics(acc, monthMetrics),
                emptyMonthlyMetrics()
            );
        },
        [activityYear]
    );

    /** Total tahunan metrik satu CCO untuk bulan tertentu */
    const getCcoMonthlyMetrics = useCallback(
        (ccoId: string, monthKey: string): KpiActivityMetrics => {
            return (
                activityYear?.ccoData[ccoId]?.monthly[monthKey] ?? emptyMonthlyMetrics()
            );
        },
        [activityYear]
    );

    /**
     * Total metrik perusahaan (semua CCO) untuk bulan tertentu atau seluruh tahun.
     * monthKey = undefined → total tahunan
     */
    const getCompanyMetrics = useCallback(
        (monthKey?: string): KpiActivityMetrics => {
            if (!activityYear) return emptyMonthlyMetrics();
            return Object.keys(activityYear.ccoData).reduce((acc, ccoId) => {
                const metrics = monthKey
                    ? getCcoMonthlyMetrics(ccoId, monthKey)
                    : getCcoAnnualMetrics(ccoId);
                return sumMetrics(acc, metrics);
            }, emptyMonthlyMetrics());
        },
        [activityYear, getCcoMonthlyMetrics, getCcoAnnualMetrics]
    );

    useEffect(() => {
        fetchKpiActivity();
    }, [fetchKpiActivity]);

    return {
        activityYear,
        isLoading,
        fetchKpiActivity,
        initializeActivityYear,
        updateCcoMonthlyActivity,
        getCcoAnnualMetrics,
        getCcoMonthlyMetrics,
        getCompanyMetrics,
    };
}