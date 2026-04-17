import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <main className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="mb-3 text-sm font-medium text-slate-500">Personal Finance SaaS</p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Take control of your money.</h1>
        <p className="mb-8 text-slate-600">
          Track transactions, set budgets, and visualize spending trends across all your accounts.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/register">
            <Button>
              Start free <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
