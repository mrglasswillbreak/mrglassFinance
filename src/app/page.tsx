import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomePageClientEnhancements } from "@/components/marketing/home-page-client-enhancements";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <main className="w-full max-w-5xl rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-xl shadow-black/10 backdrop-blur md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-alt px-3 py-1 text-xs font-medium text-muted">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Personal Finance SaaS
          </div>
          <HomePageClientEnhancements section="toggle" />
        </div>

        <h1 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
          Take control of your money with clarity.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-muted md:text-lg">
          Track transactions, set smarter budgets, and visualize spending trends across all your accounts.
        </p>

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

        <HomePageClientEnhancements section="cards" />
      </main>
    </div>
  );
}
