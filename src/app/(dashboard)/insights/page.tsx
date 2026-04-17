"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";

type InsightPoint = {
  month: string;
  incomeCents: number;
  expenseCents: number;
  netCents: number;
};

export default function InsightsPage() {
  const trends = useQuery({
    queryKey: ["spending-trends"],
    queryFn: () => apiFetch<InsightPoint[]>("/api/insights/spending-trends"),
  });

  if (trends.isLoading) return <div className="h-72 animate-pulse rounded-xl bg-slate-200" />;
  if (trends.isError || !trends.data) return <p className="text-sm text-red-600">Unable to load insights.</p>;

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold">Six month spending trend</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trends.data.map((item) => ({
              month: item.month,
              income: item.incomeCents / 100,
              expense: item.expenseCents / 100,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value) => {
                const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                return formatCurrency(Math.round((Number.isFinite(numericValue) ? numericValue : 0) * 100));
              }}
            />
            <Bar dataKey="income" fill="#16a34a" />
            <Bar dataKey="expense" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
