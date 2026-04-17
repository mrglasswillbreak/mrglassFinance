import { endOfMonth, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";

export async function GET(request: Request) {
  return withAuth(async (ctx) => {
    const date = new URL(request.url).searchParams.get("date");
    const base = date ? new Date(date) : new Date();
    const periodStart = startOfMonth(base);
    const periodEnd = endOfMonth(base);

    const budgets = await prisma.budget.findMany({
      where: { tenantId: ctx.tenantId, periodMonth: periodStart },
      include: { category: true, account: true },
    });

    const payload = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            tenantId: ctx.tenantId,
            type: "EXPENSE",
            occurredAt: { gte: periodStart, lte: periodEnd },
            ...(budget.categoryId ? { categoryId: budget.categoryId } : {}),
            ...(budget.accountId ? { accountId: budget.accountId } : {}),
          },
          _sum: { amountCents: true },
        });

        const spentCents = spent._sum.amountCents ?? 0;
        const progressPct = Math.round((spentCents / budget.limitCents) * 100);
        return {
          id: budget.id,
          budgetName: budget.category?.name ?? budget.account?.name ?? "Overall",
          limitCents: budget.limitCents,
          spentCents,
          progressPct,
          thresholdReached: progressPct >= budget.alertThresholdPct,
          exceeded: progressPct >= 100,
        };
      }),
    );

    return jsonOk(payload);
  });
}
