"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <main className="w-full max-w-5xl rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-xl shadow-black/10 backdrop-blur md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-alt px-3 py-1 text-xs font-medium text-muted">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Personal Finance SaaS
          </div>
          <ThemeToggle />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Take control of your money with clarity.
          </h1>
          <p className="mb-8 max-w-2xl text-base text-muted md:text-lg">
            Track transactions, set smarter budgets, and visualize spending trends across all your accounts.
          </p>
        </motion.div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link href="/register">
            <Button>
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { icon: TrendingUp, title: "Live insights", body: "Understand where your money goes each month." },
            { icon: ShieldCheck, title: "Reliable data", body: "Stay on top of accounts, budgets, and limits." },
            { icon: Sparkles, title: "Clean workflow", body: "A focused interface built for daily financial habits." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-border bg-surface-alt p-4"
              >
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.body}</p>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
