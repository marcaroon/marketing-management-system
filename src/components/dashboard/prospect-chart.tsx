"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROSPECT_STATUS_OPTIONS } from "@/lib/constants";
import { Prospect } from "@/types";

const COLORS = [
  "#3b82f6", // blue - prospek baru
  "#f59e0b", // amber - follow up
  "#8b5cf6", // violet - meeting
  "#f97316", // orange - negosiasi
  "#10b981", // emerald - closing
  "#ef4444", // red - reject
  "#6b7280", // gray - tidak aktif
];

interface ProspectChartProps {
  prospects: Prospect[];
}

export function ProspectChart({ prospects }: ProspectChartProps) {
  const statusCount = PROSPECT_STATUS_OPTIONS.map((option, index) => ({
    name: option.label,
    value: prospects.filter((p) => p.status === option.value).length,
    color: COLORS[index],
  })).filter((item) => item.value > 0);

  const isEmpty = statusCount.length === 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Prospek per Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Belum ada data prospek</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusCount}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {statusCount.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
