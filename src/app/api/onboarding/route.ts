import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";
import { onboardingSchema } from "@/lib/validation/finance";

async function getOnboardingStatus(userId: string, tenantId: string) {
  const [preference, accountCount, categoryCount] = await Promise.all([
    prisma.userPreference.findUnique({
      where: { userId },
      select: { id: true },
    }),
    prisma.account.count({ where: { tenantId, isArchived: false } }),
    prisma.category.count({ where: { tenantId, isArchived: false } }),
  ]);

  return {
    completed: Boolean(preference) && accountCount > 0 && categoryCount > 0,
  };
}

export async function GET() {
  return withAuth(async (ctx) => {
    const status = await getOnboardingStatus(ctx.userId, ctx.tenantId);
    return jsonOk(status);
  });
}

export async function POST(request: Request) {
  return withAuth(async (ctx) => {
    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body");

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: ctx.userId },
        data: { fullName: parsed.data.fullName },
      });

      await tx.userPreference.upsert({
        where: { userId: ctx.userId },
        update: {
          currency: parsed.data.currency,
          locale: parsed.data.locale,
          theme: "system",
          weekStart: parsed.data.weekStart,
        },
        create: {
          userId: ctx.userId,
          currency: parsed.data.currency,
          locale: parsed.data.locale,
          theme: "system",
          weekStart: parsed.data.weekStart,
        },
      });

      const existingAccounts = await tx.account.count({
        where: { tenantId: ctx.tenantId, isArchived: false },
      });
      if (!existingAccounts) {
        await tx.account.create({
          data: { tenantId: ctx.tenantId, name: "Main Account", type: "BANK", currency: parsed.data.currency },
        });
      }

      const existingCategories = await tx.category.count({
        where: { tenantId: ctx.tenantId, isArchived: false },
      });
      if (!existingCategories) {
        await tx.category.createMany({
          data: [
            { tenantId: ctx.tenantId, name: "Salary", type: "INCOME", isDefault: true, color: "#16a34a" },
            { tenantId: ctx.tenantId, name: "Food", type: "EXPENSE", isDefault: true, color: "#f59e0b" },
            { tenantId: ctx.tenantId, name: "Housing", type: "EXPENSE", isDefault: true, color: "#6366f1" },
            { tenantId: ctx.tenantId, name: "Transportation", type: "EXPENSE", isDefault: true, color: "#3b82f6" },
          ],
        });
      }
    });

    return jsonOk({ completed: true });
  });
}
