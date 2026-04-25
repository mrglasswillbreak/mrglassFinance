"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type Props = {
  section: "toggle" | "cards";
};

const featureCards = [
  { icon: TrendingUp, title: "Live insights", body: "Understand where your money goes each month." },
  { icon: ShieldCheck, title: "Reliable data", body: "Stay on top of accounts, budgets, and limits." },
  { icon: Sparkles, title: "Clean workflow", body: "A focused interface built for daily financial habits." },
];

export function HomePageClientEnhancements({ section }: Props) {
  const shouldReduceMotion = useReducedMotion();

  if (section === "toggle") {
    return <ThemeToggle />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {featureCards.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.title}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, delay: index * 0.05 }}
            className="rounded-2xl border border-border bg-surface-alt p-4"
          >
            <Icon className="mb-3 h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.body}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
