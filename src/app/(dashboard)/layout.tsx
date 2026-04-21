import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login");
  }
  const preference = await prisma.userPreference.findUnique({
    where: { userId: auth.userId },
    select: { id: true },
  });
  if (!preference) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}
