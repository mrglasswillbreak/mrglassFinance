"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

type Account = {
  id: string;
  name: string;
  type: "CASH" | "BANK" | "CRYPTO" | "CREDIT";
  currency: string;
};

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<"CASH" | "BANK" | "CRYPTO" | "CREDIT">("BANK");
  const [currency, setCurrency] = useState("USD");

  const accounts = useQuery({
    queryKey: ["accounts"],
    queryFn: () => apiFetch<Account[]>("/api/accounts"),
  });

  const createAccount = useMutation({
    mutationFn: async () =>
      apiFetch("/api/accounts", {
        method: "POST",
        body: JSON.stringify({ name, type, currency, openingBalance: 0 }),
      }),
    onSuccess: async () => {
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const archiveAccount = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/api/accounts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-sm font-semibold">Add account</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Account name" value={name} onChange={(event) => setName(event.target.value)} />
          <Select value={type} onChange={(event) => setType(event.target.value as "CASH" | "BANK" | "CRYPTO" | "CREDIT")}>
            <option value="BANK">Bank</option>
            <option value="CASH">Cash</option>
            <option value="CRYPTO">Crypto</option>
            <option value="CREDIT">Credit</option>
          </Select>
          <Input value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} />
          <Button disabled={!name || createAccount.isPending} onClick={() => createAccount.mutate()}>
            {createAccount.isPending ? "Saving..." : "Add account"}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Accounts</h2>
        <div className="space-y-2">
          {accounts.data?.map((account) => (
            <div key={account.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
              <div>
                <p className="font-medium">{account.name}</p>
                <p className="text-xs text-slate-500">
                  {account.type} · {account.currency}
                </p>
              </div>
              <Button variant="ghost" onClick={() => archiveAccount.mutate(account.id)}>
                Archive
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
