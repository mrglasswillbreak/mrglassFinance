import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-xl border border-slate-200 bg-white p-4 shadow-sm", className)}>{children}</section>;
}
