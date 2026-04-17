"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  fullName: z.string().min(2),
  tenantName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", tenantName: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError("root", { message: payload.error ?? "Registration failed" });
      return;
    }
    router.replace("/dashboard");
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="mb-1 text-2xl font-semibold">Create account</h1>
        <p className="mb-6 text-sm text-slate-600">Start tracking your finances in minutes.</p>
        <div className="mb-4 space-y-1">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full name
          </label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-red-600">{errors.fullName.message}</p>}
        </div>
        <div className="mb-4 space-y-1">
          <label htmlFor="tenantName" className="text-sm font-medium">
            Workspace name
          </label>
          <Input id="tenantName" {...register("tenantName")} />
          {errors.tenantName && <p className="text-xs text-red-600">{errors.tenantName.message}</p>}
        </div>
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-slate-900">
            Sign in
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
