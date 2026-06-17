"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prospect } from "@/types";

interface MarketingProgressProps {
  prospects: Prospect[];
}

export function MarketingProgress({ prospects }: MarketingProgressProps) {
  // Group by month
  const monthlyData: Record<string, { prospek: number; closing: number }> = {};
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];

  // Initialize current year months
  const currentYear = new Date().getFullYear();
  months.forEach((m, i) => {
    monthlyData[m] = { prospek: 0, closing: 0 };
  });

  prospects.forEach((p) => {
    if (!p.createdAt) return;
    const date = p.createdAt.toDate();
    if (date.getFullYear() !== currentYear) return;
    const month = months[date.getMonth()];
    monthlyData[month].prospek += 1;
    if (p.status === "closing") {
      monthlyData[month].closing += 1;
    }
  });

  const chartData = months.map((month) => ({
    name: month,
    prospek: monthlyData[month].prospek,
    closing: monthlyData[month].closing,
  }));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Progress Marketing {currentYear}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="prospek"
              name="Prospek"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="closing"
              name="Closing"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
