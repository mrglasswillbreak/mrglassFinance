"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, toCents } from "@/lib/format";

type Account = { id: string; name: string };
type Category = { id: string; name: string; type: "INCOME" | "EXPENSE" | "TRANSFER" };
type Transaction = {
  id: string;
  amountCents: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  occurredAt: string;
  note: string | null;
  account: { name: string };
  category: { name: string | null } | null;
};

type TransactionResponse = { items: Transaction[]; total: number; page: number; totalPages: number };

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    accountId: "",
    categoryId: "",
    type: "EXPENSE",
    amount: "",
    note: "",
    occurredAt: new Date().toISOString().slice(0, 16),
  });

  const accounts = useQuery({
    queryKey: ["accounts"],
    queryFn: () => apiFetch<Account[]>("/api/accounts"),
  });
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/api/categories"),
  });
  const transactions = useQuery({
    queryKey: ["transactions"],
    queryFn: () => apiFetch<TransactionResponse>("/api/transactions?page=1&pageSize=50"),
  });

  const createTx = useMutation({
    mutationFn: async () =>
      apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          accountId: form.accountId,
          categoryId: form.categoryId || null,
          type: form.type,
          amountCents: toCents(Number(form.amount)),
          note: form.note || null,
          occurredAt: new Date(form.occurredAt).toISOString(),
        }),
      }),
    onSuccess: async () => {
      setForm((current) => ({ ...current, amount: "", note: "" }));
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const deleteTx = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/api/transactions/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  if (accounts.isLoading || categories.isLoading || transactions.isLoading) {
    return <div className="h-44 animate-pulse rounded-2xl bg-surface-alt" />;
  }

  return (
    <PageTransition>
      <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-sm font-semibold">Add transaction</h2>
        <div className="grid gap-3 md:grid-cols-6">
          <Select value={form.accountId} onChange={(event) => setForm({ ...form, accountId: event.target.value })}>
            <option value="">Account</option>
            {accounts.data?.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
          <Select
            value={form.type}
            onChange={(event) =>
              setForm({ ...form, type: event.target.value as "INCOME" | "EXPENSE" | "TRANSFER" })
            }
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
            <option value="TRANSFER">Transfer</option>
          </Select>
          <Select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
            <option value="">Category</option>
            {categories.data
              ?.filter((category) => category.type === form.type || form.type === "TRANSFER")
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </Select>
          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
          />
          <Input type="datetime-local" value={form.occurredAt} onChange={(event) => setForm({ ...form, occurredAt: event.target.value })} />
          <Input placeholder="Note" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </div>
        <Button
          className="mt-3"
          disabled={!form.accountId || !form.amount || createTx.isPending}
          onClick={() => createTx.mutate()}
        >
          {createTx.isPending ? "Saving..." : "Add transaction"}
        </Button>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Account</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 text-right font-medium">Amount</th>
                <th className="pb-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.data?.items.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border/50">
                  <td className="py-2">{new Date(transaction.occurredAt).toLocaleString()}</td>
                  <td className="py-2">{transaction.account.name}</td>
                  <td className="py-2">{transaction.category?.name ?? "Uncategorized"}</td>
                  <td className="py-2">{transaction.type}</td>
                  <td className="py-2 text-right">{formatCurrency(transaction.amountCents)}</td>
                  <td className="py-2 text-right">
                    <Button variant="ghost" onClick={() => deleteTx.mutate(transaction.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </PageTransition>
  );
}
