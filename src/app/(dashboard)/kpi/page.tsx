"use client";

import { useState, useEffect, useMemo } from "react";
import { useKpi, formatRupiah, formatMonthKey, MONTH_NAMES } from "@/hooks/use-kpi";
import { useTeam } from "@/hooks/use-team";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Edit,
  Plus,
  Save,
  X,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { KpiDistributionMode, UserProfile } from "@/types";
import { cn } from "@/lib/utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

function pct(actual: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.min((actual / target) * 100, 999);
}

function PctBadge({ value }: { value: number }) {
  const color =
    value >= 100
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      : value >= 75
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
        : value >= 50
          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", color)}>
      {value.toFixed(1)}%
    </span>
  );
}

function RupiahInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
}) {
  const [raw, setRaw] = useState(value !== undefined ? String(value) : "");

  useEffect(() => {
    setRaw(value !== undefined ? String(value) : "");
  }, [value]);

  return (
    <Input
      type="number"
      min={0}
      value={raw}
      placeholder={placeholder ?? "0"}
      className={className}
      onChange={(e) => {
        setRaw(e.target.value);
        const num = Number(e.target.value);
        if (!isNaN(num)) onChange(num);
      }}
    />
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function KpiPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { isAdmin } = useAuth();

  const {
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
  } = useKpi(selectedYear);

  const { members, isLoading: membersLoading } = useTeam();

  // Only marketing users (role = marketing) are CCO
  const ccoMembers = useMemo(
    () => members.filter((m) => m.role === "marketing" && m.status === "active"),
    [members]
  );

  // Fetch realization whenever members or year changes
  useEffect(() => {
    if (ccoMembers.length > 0) {
      fetchRealization(ccoMembers);
    }
  }, [ccoMembers, selectedYear, fetchRealization]);

  // ── UI states ──────────────────────────────────────────────────────────────
  const [showInitDialog, setShowInitDialog] = useState(false);
  const [showEditGlobalDialog, setShowEditGlobalDialog] = useState(false);
  const [editingCcoId, setEditingCcoId] = useState<string | null>(null);
  const [expandedCco, setExpandedCco] = useState<string | null>(null);

  // Init dialog state
  const [initAnnualTarget, setInitAnnualTarget] = useState(0);
  const [initMode, setInitMode] = useState<KpiDistributionMode>("top_down");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit global dialog state
  const [editAnnualTarget, setEditAnnualTarget] = useState(0);
  const [editMode, setEditMode] = useState<KpiDistributionMode>("top_down");

  // CCO edit state
  const [editCcoAnnual, setEditCcoAnnual] = useState(0);
  const [editCcoMonthly, setEditCcoMonthly] = useState<Record<string, number | null>>({});

  // ── derived summary ───────────────────────────────────────────────────────
  const totalAnnualActual = useMemo(
    () => Object.values(realization).reduce((s, r) => s + r.annualActual, 0),
    [realization]
  );

  const currentMonthKey = formatMonthKey(currentYear, new Date().getMonth());
  const currentMonthTarget = getCompanyMonthlyTarget(currentMonthKey);
  const currentMonthActual = useMemo(
    () =>
      Object.values(realization).reduce(
        (s, r) => s + (r.monthlyActual[currentMonthKey] || 0),
        0
      ),
    [realization, currentMonthKey]
  );

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleInit = async () => {
    if (initAnnualTarget <= 0) return;
    setIsSubmitting(true);
    try {
      await initializeYear(initAnnualTarget, ccoMembers, initMode);
      setShowInitDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGlobal = async () => {
    if (editAnnualTarget <= 0) return;
    setIsSubmitting(true);
    try {
      await updateAnnualTarget(editAnnualTarget, ccoMembers, editMode);
      setShowEditGlobalDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditGlobal = () => {
    setEditAnnualTarget(kpiYear?.annualTarget ?? 0);
    setEditMode(kpiYear?.distributionMode ?? "top_down");
    setShowEditGlobalDialog(true);
  };

  const openEditCco = (ccoId: string) => {
    const cco = kpiYear?.ccoTargets[ccoId];
    setEditCcoAnnual(cco?.annualTarget ?? 0);
    setEditCcoMonthly({});
    setEditingCcoId(ccoId);
  };

  const handleSaveCco = async () => {
    if (!editingCcoId) return;
    setIsSubmitting(true);
    try {
      // Collect overrides from editCcoMonthly (only non-null values)
      const existing = kpiYear?.ccoTargets[editingCcoId]?.monthlyOverrides || {};
      const merged: Record<string, number> = { ...existing };

      Object.entries(editCcoMonthly).forEach(([k, v]) => {
        if (v === null) {
          delete merged[k];
        } else {
          merged[k] = v;
        }
      });

      await updateCcoTarget(editingCcoId, editCcoAnnual, merged);
      setEditingCcoId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── loading / empty states ────────────────────────────────────────────────
  const pageLoading = isLoading || membersLoading;

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="KPI Omzet" description="Pantau target dan realisasi omzet tim marketing" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  // ── render: KPI not yet set up for selected year ──────────────────────────
  if (!kpiYear) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="KPI Omzet"
          description="Pantau target dan realisasi omzet tim marketing"
        >
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PageHeader>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
            <Target className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Belum Ada Target KPI {selectedYear}</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Buat target omzet tahunan untuk tahun {selectedYear}. Target akan otomatis
            dibagi ke seluruh CCO ({ccoMembers.length} orang).
          </p>
          {isAdmin ? (
            <Button
              onClick={() => setShowInitDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Buat Target KPI {selectedYear}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Hubungi admin untuk membuat target KPI tahun ini.
            </p>
          )}
        </div>

        {/* Init Dialog */}
        <Dialog open={showInitDialog} onOpenChange={setShowInitDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Target KPI {selectedYear}</DialogTitle>
              <DialogDescription>
                Target tahunan akan dibagi merata ke {ccoMembers.length} CCO aktif.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Target Omzet Tahunan (Rp)</Label>
                <RupiahInput
                  value={initAnnualTarget || undefined}
                  onChange={setInitAnnualTarget}
                  placeholder="Contoh: 12000000000"
                  className="mt-1"
                />
                {initAnnualTarget > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    = {formatRupiah(initAnnualTarget)} · Target bulanan:{" "}
                    {formatRupiah(initAnnualTarget / 12)} · Per CCO:{" "}
                    {ccoMembers.length > 0
                      ? formatRupiah(initAnnualTarget / ccoMembers.length)
                      : "-"}
                  </p>
                )}
              </div>
              <div>
                <Label>Mode Distribusi</Label>
                <Select
                  value={initMode}
                  onValueChange={(v) => setInitMode(v as KpiDistributionMode)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top_down">
                      Top-Down — Total tetap, CCO dibagi rata
                    </SelectItem>
                    <SelectItem value="bottom_up">
                      Bottom-Up — Total mengikuti jumlah target CCO
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowInitDialog(false)}>
                  Batal
                </Button>
                <Button
                  onClick={handleInit}
                  disabled={initAnnualTarget <= 0 || isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Simpan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── main KPI view ─────────────────────────────────────────────────────────
  const annualTarget = kpiYear.annualTarget;
  const monthlyTarget = annualTarget / 12; // company-level baseline

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="KPI Omzet"
        description={`Target & realisasi omzet tim marketing — ${selectedYear}`}
      >
        <div className="flex items-center gap-2">
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={openEditGlobal}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Target
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Distribution mode badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            kpiYear.distributionMode === "top_down"
              ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
              : "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300"
          )}
        >
          {kpiYear.distributionMode === "top_down" ? "Mode: Top-Down" : "Mode: Bottom-Up"}
        </Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 cursor-help text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs text-xs">
            {kpiYear.distributionMode === "top_down"
              ? "Total tahunan ditetapkan admin. Target per-CCO dihitung rata-rata dan bisa diubah individual."
              : "Target per-CCO diinput individual. Total tahunan = jumlah semua target CCO."}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Annual Target */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Target Tahunan {selectedYear}
                </p>
                <p className="mt-1 text-xl font-bold">{formatRupiah(annualTarget)}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Progress
              value={pct(totalAnnualActual, annualTarget)}
              className="mt-3 h-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Realisasi: {formatRupiah(totalAnnualActual)} (
              <PctBadge value={pct(totalAnnualActual, annualTarget)} />)
            </p>
          </CardContent>
        </Card>

        {/* Monthly Target (current month) */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Target Bulanan ({MONTH_NAMES[new Date().getMonth()]})
                </p>
                <p className="mt-1 text-xl font-bold">
                  {formatRupiah(currentMonthTarget)}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
                <TrendingUp className="h-5 w-5 text-violet-600" />
              </div>
            </div>
            <Progress
              value={pct(currentMonthActual, currentMonthTarget)}
              className="mt-3 h-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Realisasi: {formatRupiah(currentMonthActual)} (
              <PctBadge value={pct(currentMonthActual, currentMonthTarget)} />)
            </p>
          </CardContent>
        </Card>

        {/* CCO Count */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Jumlah CCO Aktif
                </p>
                <p className="mt-1 text-xl font-bold">{ccoMembers.length} orang</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Target rata-rata per CCO:{" "}
              {ccoMembers.length > 0
                ? formatRupiah(annualTarget / ccoMembers.length)
                : "-"}
            </p>
          </CardContent>
        </Card>

        {/* Annual left */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Sisa Target Tahunan
                </p>
                <p
                  className={cn(
                    "mt-1 text-xl font-bold",
                    annualTarget - totalAnnualActual <= 0 && "text-emerald-600"
                  )}
                >
                  {formatRupiah(Math.max(0, annualTarget - totalAnnualActual))}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  annualTarget - totalAnnualActual <= 0
                    ? "bg-emerald-100 dark:bg-emerald-900/40"
                    : "bg-orange-100 dark:bg-orange-900/40"
                )}
              >
                {annualTarget - totalAnnualActual <= 0 ? (
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {annualTarget - totalAnnualActual <= 0
                ? "🎉 Target tahunan tercapai!"
                : `${pct(totalAnnualActual, annualTarget).toFixed(1)}% dari target`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: per-CCO | monthly breakdown */}
      <Tabs defaultValue="cco">
        <TabsList>
          <TabsTrigger value="cco">CCO</TabsTrigger>
          <TabsTrigger value="monthly">Bulanan</TabsTrigger>
        </TabsList>

        {/* ── PER CCO TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="cco" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Target & Realisasi per CCO</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama CCO</TableHead>
                    <TableHead className="text-right">Target Tahunan</TableHead>
                    <TableHead className="text-right">Realisasi</TableHead>
                    <TableHead className="text-center">Pencapaian</TableHead>
                    <TableHead className="text-right">
                      Target Bln ({MONTH_NAMES[new Date().getMonth()]})
                    </TableHead>
                    <TableHead className="text-right">
                      Real. Bln
                    </TableHead>
                    {isAdmin && <TableHead className="w-[100px]" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ccoMembers.map((m) => {
                    const target = kpiYear.ccoTargets[m.uid];
                    const actual = realization[m.uid];
                    const annualTgt = target?.annualTarget ?? 0;
                    const annualAct = actual?.annualActual ?? 0;
                    const monthTgt = getCcoMonthlyTarget(m.uid, currentMonthKey);
                    const monthAct = actual?.monthlyActual[currentMonthKey] ?? 0;
                    const isExpanded = expandedCco === m.uid;

                    return (
                      <>
                        <TableRow
                          key={m.uid}
                          className="cursor-pointer hover:bg-accent/40"
                          onClick={() => setExpandedCco(isExpanded ? null : m.uid)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-bold text-white">
                                {m.displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-sm">{m.displayName}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm">{formatRupiah(annualTgt)}</TableCell>
                          <TableCell className="text-right text-sm">{formatRupiah(annualAct)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <PctBadge value={pct(annualAct, annualTgt)} />
                              <Progress value={pct(annualAct, annualTgt)} className="h-1 w-20" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm">{formatRupiah(monthTgt)}</TableCell>
                          <TableCell className="text-right text-sm">
                            <span className={cn(monthAct >= monthTgt ? "text-emerald-600 font-semibold" : "")}>
                              {formatRupiah(monthAct)}
                            </span>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditCco(m.uid);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>

                        {/* Expanded monthly row */}
                        {isExpanded && (
                          <TableRow key={`${m.uid}-detail`} className="bg-accent/20">
                            <TableCell colSpan={isAdmin ? 7 : 6} className="py-3">
                              <div className="px-2">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Rincian Bulanan {selectedYear}
                                </p>
                                <div className="grid gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
                                  {MONTH_NAMES.map((mn, mi) => {
                                    const mk = formatMonthKey(selectedYear, mi);
                                    const tgt = getCcoMonthlyTarget(m.uid, mk);
                                    const act = actual?.monthlyActual[mk] ?? 0;
                                    const hasOverride =
                                      target?.monthlyOverrides[mk] !== undefined;
                                    return (
                                      <div
                                        key={mk}
                                        className={cn(
                                          "rounded-lg border p-2 text-xs",
                                          mi === new Date().getMonth() && selectedYear === currentYear
                                            ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
                                            : "border-border"
                                        )}
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium">{mn}</span>
                                          {hasOverride && (
                                            <span className="rounded-full bg-violet-100 px-1 text-[10px] text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                                              custom
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-muted-foreground">
                                          Target: {formatRupiah(tgt)}
                                        </p>
                                        <p className={cn(act >= tgt && act > 0 ? "text-emerald-600 font-semibold" : "")}>
                                          Real: {formatRupiah(act)}
                                        </p>
                                        <Progress
                                          value={pct(act, tgt)}
                                          className="mt-1 h-1"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}

                  {/* Company total row */}
                  <TableRow className="border-t-2 bg-accent/30 font-semibold">
                    <TableCell>Total Perusahaan</TableCell>
                    <TableCell className="text-right">{formatRupiah(annualTarget)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(totalAnnualActual)}</TableCell>
                    <TableCell className="text-center">
                      <PctBadge value={pct(totalAnnualActual, annualTarget)} />
                    </TableCell>
                    <TableCell className="text-right">{formatRupiah(currentMonthTarget)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(currentMonthActual)}</TableCell>
                    {isAdmin && <TableCell />}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MONTHLY TAB ──────────────────────────────────────────────────── */}
        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Ringkasan Bulanan {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bulan</TableHead>
                    <TableHead className="text-right">Target Perusahaan</TableHead>
                    <TableHead className="text-right">Realisasi</TableHead>
                    <TableHead className="text-center">Pencapaian</TableHead>
                    <TableHead className="text-right">Gap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MONTH_NAMES.map((mn, mi) => {
                    const mk = formatMonthKey(selectedYear, mi);
                    const tgt = getCompanyMonthlyTarget(mk);
                    const act = Object.values(realization).reduce(
                      (s, r) => s + (r.monthlyActual[mk] || 0),
                      0
                    );
                    const gap = act - tgt;
                    const isCurrent =
                      mi === new Date().getMonth() && selectedYear === currentYear;
                    const isFuture =
                      selectedYear > currentYear ||
                      (selectedYear === currentYear && mi > new Date().getMonth());

                    return (
                      <TableRow
                        key={mk}
                        className={cn(
                          isCurrent && "bg-blue-50/60 dark:bg-blue-950/20",
                          isFuture && "opacity-50"
                        )}
                      >
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-2">
                            {mn}
                            {/* {isCurrent && (
                              <Badge className="h-4 px-1.5 text-[10px]">Ini</Badge>
                            )} */}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{formatRupiah(tgt)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(act)}</TableCell>
                        <TableCell className="text-center">
                          {isFuture ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <PctBadge value={pct(act, tgt)} />
                              <Progress value={pct(act, tgt)} className="h-1 w-20" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right text-sm font-medium",
                            isFuture ? "text-muted-foreground" :
                              gap >= 0 ? "text-emerald-600" : "text-red-500"
                          )}
                        >
                          {isFuture
                            ? "—"
                            : gap >= 0
                              ? `+${formatRupiah(gap)}`
                              : `-${formatRupiah(Math.abs(gap))}`}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Annual total */}
                  <TableRow className="border-t-2 bg-accent/30 font-semibold">
                    <TableCell>Total {selectedYear}</TableCell>
                    <TableCell className="text-right">{formatRupiah(annualTarget)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(totalAnnualActual)}</TableCell>
                    <TableCell className="text-center">
                      <PctBadge value={pct(totalAnnualActual, annualTarget)} />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        totalAnnualActual - annualTarget >= 0 ? "text-emerald-600" : "text-red-500"
                      )}
                    >
                      {totalAnnualActual - annualTarget >= 0
                        ? `+${formatRupiah(totalAnnualActual - annualTarget)}`
                        : `-${formatRupiah(Math.abs(totalAnnualActual - annualTarget))}`}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Edit Global Target Dialog ─────────────────────────────────────── */}
      <Dialog open={showEditGlobalDialog} onOpenChange={setShowEditGlobalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Target KPI {selectedYear}</DialogTitle>
            <DialogDescription>
              {editMode === "top_down"
                ? "Target per-CCO akan dihitung ulang secara merata berdasarkan total baru."
                : "Total tahunan mengikuti jumlah semua target per-CCO individual."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Mode Distribusi</Label>
              <Select
                value={editMode}
                onValueChange={(v) => setEditMode(v as KpiDistributionMode)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top_down">
                    Top-Down — Total tetap, CCO dibagi rata
                  </SelectItem>
                  <SelectItem value="bottom_up">
                    Bottom-Up — Total mengikuti jumlah target CCO
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editMode === "top_down" && (
              <div>
                <Label>Target Omzet Tahunan (Rp)</Label>
                <RupiahInput
                  value={editAnnualTarget || undefined}
                  onChange={setEditAnnualTarget}
                  placeholder="Contoh: 12000000000"
                  className="mt-1"
                />
                {editAnnualTarget > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    = {formatRupiah(editAnnualTarget)} · Bulanan:{" "}
                    {formatRupiah(editAnnualTarget / 12)} · Per CCO:{" "}
                    {ccoMembers.length > 0
                      ? formatRupiah(editAnnualTarget / ccoMembers.length)
                      : "-"}
                  </p>
                )}
              </div>
            )}
            {editMode === "bottom_up" && (
              <div className="rounded-lg bg-accent/40 p-3 text-xs text-muted-foreground">
                Dalam mode Bottom-Up, total tahunan dihitung otomatis dari jumlah target
                masing-masing CCO. Edit target per-CCO menggunakan tombol Edit di tabel.
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowEditGlobalDialog(false)}>
                Batal
              </Button>
              <Button
                onClick={handleUpdateGlobal}
                disabled={
                  isSubmitting ||
                  (editMode === "top_down" && editAnnualTarget <= 0)
                }
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit CCO Target Dialog ────────────────────────────────────────── */}
      {editingCcoId && (
        <Dialog open={!!editingCcoId} onOpenChange={() => setEditingCcoId(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit Target CCO —{" "}
                {ccoMembers.find((m) => m.uid === editingCcoId)?.displayName}
              </DialogTitle>
              <DialogDescription>
                Override target tahunan dan/atau target bulanan individual.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Annual override */}
              <div>
                <Label>Target Tahunan (Rp)</Label>
                <RupiahInput
                  value={editCcoAnnual}
                  onChange={setEditCcoAnnual}
                  className="mt-1"
                />
                {editCcoAnnual > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Target bulanan default: {formatRupiah(editCcoAnnual / 12)}
                  </p>
                )}
              </div>

              <Separator />

              {/* Monthly overrides */}
              <div>
                <p className="mb-2 text-sm font-medium">
                  Override Target Bulanan{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (kosongkan = gunakan tahunan ÷ 12)
                  </span>
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {MONTH_NAMES.map((mn, mi) => {
                    const mk = formatMonthKey(selectedYear, mi);
                    const existingOverride = kpiYear.ccoTargets[editingCcoId]?.monthlyOverrides[mk];
                    const pendingOverride = editCcoMonthly[mk];
                    const displayValue =
                      pendingOverride !== undefined
                        ? pendingOverride === null
                          ? ""
                          : String(pendingOverride)
                        : existingOverride !== undefined
                          ? String(existingOverride)
                          : "";
                    const hasOverride =
                      (pendingOverride !== undefined && pendingOverride !== null) ||
                      (pendingOverride === undefined && existingOverride !== undefined);

                    return (
                      <div key={mk} className="flex items-center gap-2">
                        <Label className="w-20 text-xs text-muted-foreground shrink-0">
                          {mn}
                        </Label>
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            min={0}
                            placeholder={`${formatRupiah(editCcoAnnual / 12)}`}
                            value={displayValue}
                            className={cn("pr-8 text-xs h-8", hasOverride && "border-violet-400")}
                            onChange={(e) => {
                              const v = e.target.value === "" ? null : Number(e.target.value);
                              setEditCcoMonthly((prev) => ({ ...prev, [mk]: v }));
                            }}
                          />
                          {hasOverride && (
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              onClick={() =>
                                setEditCcoMonthly((prev) => ({ ...prev, [mk]: null }))
                              }
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingCcoId(null)}>
                  Batal
                </Button>
                <Button
                  onClick={handleSaveCco}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
