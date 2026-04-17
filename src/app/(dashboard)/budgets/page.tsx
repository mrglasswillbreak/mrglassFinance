"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, toCents } from "@/lib/format";

type Budget = {
  id: string;
  limitCents: number;
  alertThresholdPct: number;
  category?: { name: string } | null;
  account?: { name: string } | null;
};
type Category = { id: string; name: string; type: "INCOME" | "EXPENSE" | "TRANSFER" };
type BudgetStatus = {
  id: string;
  progressPct: number;
  spentCents: number;
  thresholdReached: boolean;
  exceeded: boolean;
};

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [limit, setLimit] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const budgets = useQuery({
    queryKey: ["budgets"],
    queryFn: () => apiFetch<Budget[]>("/api/budgets"),
  });
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/api/categories"),
  });
  const status = useQuery({
    queryKey: ["budget-status"],
    queryFn: () => apiFetch<BudgetStatus[]>("/api/budgets/status"),
  });

  const createBudget = useMutation({
    mutationFn: async () =>
      apiFetch("/api/budgets", {
        method: "POST",
        body: JSON.stringify({
          categoryId: categoryId || null,
          periodMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          limitCents: toCents(Number(limit)),
          alertThresholdPct: 80,
        }),
      }),
    onSuccess: async () => {
      setLimit("");
      setCategoryId("");
      await queryClient.invalidateQueries({ queryKey: ["budgets"] });
      await queryClient.invalidateQueries({ queryKey: ["budget-status"] });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/api/budgets/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["budgets"] });
      await queryClient.invalidateQueries({ queryKey: ["budget-status"] });
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-sm font-semibold">Create monthly budget</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Choose expense category</option>
            {categories.data
              ?.filter((category) => category.type === "EXPENSE")
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </Select>
          <Input
            type="number"
            step="0.01"
            placeholder="Limit amount"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
          />
          <Button disabled={!limit || createBudget.isPending} onClick={() => createBudget.mutate()}>
            {createBudget.isPending ? "Saving..." : "Create budget"}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Budget status</h2>
        <div className="space-y-3">
          {budgets.data?.map((budget) => {
            const itemStatus = status.data?.find((item) => item.id === budget.id);
            return (
              <div key={budget.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{budget.category?.name ?? budget.account?.name ?? "Overall"}</p>
                  <p className="text-sm text-slate-600">{formatCurrency(budget.limitCents)}</p>
                </div>
                <div className="mt-2 h-2 rounded bg-slate-200">
                  <div
                    className={`h-2 rounded ${itemStatus?.exceeded ? "bg-red-500" : itemStatus?.thresholdReached ? "bg-amber-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(itemStatus?.progressPct ?? 0, 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{formatCurrency(itemStatus?.spentCents ?? 0)} spent</span>
                  <span>{itemStatus?.progressPct ?? 0}%</span>
                </div>
                <Button variant="ghost" className="mt-2" onClick={() => deleteBudget.mutate(budget.id)}>
                  Delete
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
