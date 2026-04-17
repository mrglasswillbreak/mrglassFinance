"use client";

import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";

type Summary = {
  kpis: {
    incomeCents: number;
    expenseCents: number;
    netCents: number;
    incomeDeltaCents: number;
    expenseDeltaCents: number;
  };
  recentTransactions: Array<{
    id: string;
    type: "INCOME" | "EXPENSE" | "TRANSFER";
    amountCents: number;
    occurredAt: string;
    note: string | null;
    category: { name: string | null } | null;
  }>;
  categorySpend: Array<{ name: string; amountCents: number; color: string }>;
};

type TrendPoint = {
  month: string;
  incomeCents: number;
  expenseCents: number;
  netCents: number;
};

export default function DashboardPage() {
  const summary = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiFetch<Summary>("/api/dashboard/summary"),
  });
  const trends = useQuery({
    queryKey: ["spending-trends"],
    queryFn: () => apiFetch<TrendPoint[]>("/api/insights/spending-trends"),
  });

  if (summary.isLoading || trends.isLoading) {
    return <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />)}</div>;
  }

  if (summary.isError || trends.isError || !summary.data || !trends.data) {
    return <p className="text-sm text-red-600">Unable to load dashboard right now.</p>;
  }

  const { kpis } = summary.data;
  const trendData = trends.data.map((item) => ({
    month: item.month,
    income: item.incomeCents / 100,
    expense: item.expenseCents / 100,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Income</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(kpis.incomeCents)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Expenses</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(kpis.expenseCents)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Net</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(kpis.netCents)}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Income vs Expense</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#dc2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold">Category spend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.data.categorySpend} dataKey="amountCents" nameKey="name" innerRadius={70} outerRadius={110}>
                  {summary.data.categorySpend.map((entry) => (
                    <Cell key={entry.name} fill={entry.color || "#64748b"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                    return formatCurrency(Number.isFinite(numericValue) ? Math.round(numericValue) : 0);
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Recent transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {summary.data.recentTransactions.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2">{new Date(item.occurredAt).toLocaleDateString()}</td>
                  <td className="py-2">{item.category?.name ?? "Uncategorized"}</td>
                  <td className="py-2">{item.type}</td>
                  <td className="py-2 text-right">{formatCurrency(item.amountCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
