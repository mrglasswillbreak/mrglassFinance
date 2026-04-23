"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  LayoutDashboard,
  Menu,
  Receipt,
  Sparkles,
  Target,
  WalletCards,
  LineChart,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/accounts", label: "Accounts", icon: WalletCards },
  { href: "/insights", label: "Insights", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.button
              type="button"
              className="fixed inset-0 z-20 bg-slate-950/40 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-border/80 bg-surface/95 p-4 backdrop-blur-sm transition-transform md:static md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-primary/15 p-2 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold">mrGlassFinance</p>
            </div>
            <Button variant="ghost" className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/40"
                      : "text-muted hover:bg-surface-alt hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Button variant="secondary" className="mt-auto w-full" onClick={handleLogout}>
            Log out
          </Button>
        </aside>

        <div className="min-h-screen flex-1 md:ml-0">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-surface/90 px-4 py-3 backdrop-blur md:px-6">
            <Button variant="secondary" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-4 w-4" />
              Menu
            </Button>
            <div className="hidden text-sm text-muted md:block">Welcome back</div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="secondary" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
