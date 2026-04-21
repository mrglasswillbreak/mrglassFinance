"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  color: string | null;
  isDefault: boolean;
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE" | "TRANSFER">("EXPENSE");
  const [color, setColor] = useState("#64748b");

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/api/categories"),
  });

  const createCategory = useMutation({
    mutationFn: async () =>
      apiFetch("/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name,
          type,
          color,
        }),
      }),
    onSuccess: async () => {
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/api/categories/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-sm font-semibold">Create category</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
          <Select
            value={type}
            onChange={(event) => setType(event.target.value as "INCOME" | "EXPENSE" | "TRANSFER")}
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
            <option value="TRANSFER">Transfer</option>
          </Select>
          <Input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          <Button disabled={!name || createCategory.isPending} onClick={() => createCategory.mutate()}>
            {createCategory.isPending ? "Saving..." : "Add category"}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Categories</h2>
        <div className="space-y-2">
          {categories.data?.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color || "#64748b" }}
                />
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-slate-500">
                    {category.type} {category.isDefault ? "· Default" : ""}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                disabled={category.isDefault}
                onClick={() => deleteCategory.mutate(category.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
