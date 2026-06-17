"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/page-header";
import { useProspects } from "@/hooks/use-prospects";
import { useClients } from "@/hooks/use-clients";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { PROSPECT_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { exportReportToPDF, exportReportToExcel } from "@/lib/export-utils";
import { FileDown, FileSpreadsheet, Download } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316"];

export default function ReportsPage() {
  const { isAdmin } = useAuth();
  const { prospects, isLoading: pLoading } = useProspects();
  const { clients, isLoading: cLoading } = useClients();
  const { events, isLoading: eLoading } = useEvents();

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const currentYear = new Date().getFullYear();

  // Monthly prospects
  const monthlyData = useMemo(() => {
    return months.map((m, i) => {
      const monthProspects = prospects.filter((p) => {
        if (!p.createdAt) return false;
        const d = p.createdAt.toDate();
        return d.getFullYear() === currentYear && d.getMonth() === i;
      });
      const closings = monthProspects.filter((p) => p.status === "closing");
      return { name: m, prospek: monthProspects.length, closing: closings.length };
    });
  }, [prospects]);

  // Closing rate
  const closingRate = useMemo(() => {
    return months.map((m, i) => {
      const total = monthlyData[i].prospek;
      const closing = monthlyData[i].closing;
      return { name: m, rate: total > 0 ? Math.round((closing / total) * 100) : 0 };
    });
  }, [monthlyData]);

  // Lead source distribution
  const leadSourceData = useMemo(() => {
    return LEAD_SOURCE_OPTIONS.map((o, i) => ({
      name: o.label,
      value: prospects.filter((p) => p.leadSource === o.value).length,
      color: COLORS[i % COLORS.length],
    })).filter((d) => d.value > 0);
  }, [prospects]);

  // Status distribution
  const statusData = useMemo(() => {
    return PROSPECT_STATUS_OPTIONS.map((o, i) => ({
      name: o.label,
      value: prospects.filter((p) => p.status === o.value).length,
      color: COLORS[i % COLORS.length],
    })).filter((d) => d.value > 0);
  }, [prospects]);

  const isLoading = pLoading || cLoading || eLoading;

  if (!isAdmin) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan & Analitik" description="Laporan performa marketing">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-800">
              <Download className="mr-2 h-4 w-4" />
              Export Laporan
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportReportToPDF(prospects, clients, events)}>
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportReportToExcel(prospects, clients, events)}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Prospek", value: prospects.length, color: "text-blue-600" },
          { label: "Total Klien", value: clients.length, color: "text-emerald-600" },
          { label: "Total Event", value: events.length, color: "text-violet-600" },
          { label: "Closing Rate", value: `${prospects.length > 0 ? Math.round((prospects.filter((p) => p.status === "closing").length / prospects.length) * 100) : 0}%`, color: "text-amber-600" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className={`mt-2 text-3xl font-bold ${s.color}`}>{isLoading ? "..." : s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Prospek per Bulan</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[280px]" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="prospek" name="Prospek" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="closing" name="Closing" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Closing Rate (%)</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[280px]" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={closingRate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" name="Closing Rate" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Sumber Lead</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[280px]" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {leadSourceData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Distribusi Status</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[280px]" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {statusData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
