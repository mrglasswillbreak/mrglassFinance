"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/theme-toggle";

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
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-surface/95 p-6 shadow-xl shadow-black/10 backdrop-blur-sm"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-alt px-3 py-1 text-xs text-muted">
            <Landmark className="h-3.5 w-3.5 text-primary" />
            mrGlassFinance
          </div>
          <ThemeToggle />
        </div>

        <h1 className="mb-1 text-2xl font-semibold">Create account</h1>
        <p className="mb-6 text-sm text-muted">Start tracking your finances in minutes.</p>
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
        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary">
            Sign in
          </Link>
          .
        </p>
      </motion.form>
    </div>
  );
}
