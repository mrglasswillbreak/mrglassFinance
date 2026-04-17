import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
