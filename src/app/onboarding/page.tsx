"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { apiFetch, ApiError } from "@/lib/api/client";

const schema = z.object({
  fullName: z.string().min(2),
  currency: z.string().length(3),
  locale: z.string().min(2).max(20),
  weekStart: z.enum(["monday", "sunday"]),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const status = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () => apiFetch<{ completed: boolean }>("/api/onboarding"),
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      currency: "USD",
      locale: "en-US",
      weekStart: "monday",
    },
  });

  const completeOnboarding = useMutation({
    mutationFn: async (values: FormValues) =>
      apiFetch("/api/onboarding", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      router.replace("/dashboard");
    },
  });

  useEffect(() => {
    if (status.data?.completed) {
      router.replace("/dashboard");
    }
  }, [router, status.data?.completed]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await completeOnboarding.mutateAsync(values);
    } catch (error) {
      setError("root", {
        message: error instanceof ApiError ? error.message : "Unable to complete onboarding",
      });
    }
  });

  if (status.isLoading) {
    return <div className="mx-auto mt-24 h-32 w-full max-w-xl animate-pulse rounded-xl bg-slate-200" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="mb-1 text-2xl font-semibold">Finish setup</h1>
        <p className="mb-6 text-sm text-slate-600">Set your preferences before opening your dashboard.</p>

        <div className="mb-4 space-y-1">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full name
          </label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-red-600">{errors.fullName.message}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="currency" className="text-sm font-medium">
              Currency
            </label>
            <Input id="currency" maxLength={3} {...register("currency")} />
            {errors.currency && <p className="text-xs text-red-600">{errors.currency.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="locale" className="text-sm font-medium">
              Locale
            </label>
            <Input id="locale" {...register("locale")} />
            {errors.locale && <p className="text-xs text-red-600">{errors.locale.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="weekStart" className="text-sm font-medium">
              Week starts
            </label>
            <Select id="weekStart" {...register("weekStart")}>
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </Select>
            {errors.weekStart && <p className="text-xs text-red-600">{errors.weekStart.message}</p>}
          </div>
        </div>

        {errors.root && <p className="mt-4 text-sm text-red-600">{errors.root.message}</p>}
        <Button type="submit" className="mt-6 w-full" disabled={isSubmitting || completeOnboarding.isPending}>
          {isSubmitting || completeOnboarding.isPending ? "Saving..." : "Continue to dashboard"}
        </Button>
      </form>
    </div>
  );
}
