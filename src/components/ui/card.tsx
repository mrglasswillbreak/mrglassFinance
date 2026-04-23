import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={cn("rounded-2xl border border-border/80 bg-surface/95 p-5 shadow-lg shadow-black/5 backdrop-blur-sm", className)}
    >
      {children}
    </section>
  );
}
