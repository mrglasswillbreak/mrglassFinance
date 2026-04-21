"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;
type LoginResponse = { requiresOnboarding: boolean };

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json()) as { data?: LoginResponse; error?: string };
    if (!response.ok) {
      setError("root", { message: payload.error ?? "Login failed" });
      return;
    }
    router.replace(payload.data?.requiresOnboarding ? "/onboarding" : "/dashboard");
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-slate-600">Welcome back to mrGlassFinance.</p>
        <div className="mb-4 space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div className="mb-4 space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
        </div>
        {errors.root && <p className="mb-4 text-sm text-red-600">{errors.root.message}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
        <p className="mt-4 text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-slate-900">
            Create one
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
