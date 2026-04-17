import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";

export async function GET(request: Request) {
  return withAuth(async (ctx) => {
    const search = new URL(request.url).searchParams;
    const baseDate = search.get("date") ? new Date(search.get("date") as string) : new Date();
    const from = startOfMonth(baseDate);
    const to = endOfMonth(baseDate);
    const prevFrom = startOfMonth(subMonths(baseDate, 1));
    const prevTo = endOfMonth(subMonths(baseDate, 1));

    const [current, previous, recentTransactions, categorySpend] = await Promise.all([
      prisma.transaction.findMany({
        where: { tenantId: ctx.tenantId, occurredAt: { gte: from, lte: to } },
        select: { type: true, amountCents: true },
      }),
      prisma.transaction.findMany({
        where: { tenantId: ctx.tenantId, occurredAt: { gte: prevFrom, lte: prevTo } },
        select: { type: true, amountCents: true },
      }),
      prisma.transaction.findMany({
        where: { tenantId: ctx.tenantId },
        include: { account: true, category: true },
        orderBy: { occurredAt: "desc" },
        take: 8,
      }),
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { tenantId: ctx.tenantId, type: "EXPENSE", occurredAt: { gte: from, lte: to } },
        _sum: { amountCents: true },
      }),
    ]);

    const totals = current.reduce(
      (acc, item) => {
        if (item.type === "INCOME") acc.income += item.amountCents;
        if (item.type === "EXPENSE") acc.expense += item.amountCents;
        return acc;
      },
      { income: 0, expense: 0 },
    );

    const prevTotals = previous.reduce(
      (acc, item) => {
        if (item.type === "INCOME") acc.income += item.amountCents;
        if (item.type === "EXPENSE") acc.expense += item.amountCents;
        return acc;
      },
      { income: 0, expense: 0 },
    );

    const categories = await prisma.category.findMany({
      where: { id: { in: categorySpend.map((item) => item.categoryId).filter(Boolean) as string[] } },
      select: { id: true, name: true, color: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return jsonOk({
      kpis: {
        incomeCents: totals.income,
        expenseCents: totals.expense,
        netCents: totals.income - totals.expense,
        incomeDeltaCents: totals.income - prevTotals.income,
        expenseDeltaCents: totals.expense - prevTotals.expense,
      },
      recentTransactions,
      categorySpend: categorySpend.map((item) => ({
        categoryId: item.categoryId,
        name: item.categoryId ? categoryMap.get(item.categoryId)?.name ?? "Unknown" : "Uncategorized",
        color: item.categoryId ? categoryMap.get(item.categoryId)?.color ?? "#64748b" : "#64748b",
        amountCents: item._sum.amountCents ?? 0,
      })),
    });
  });
}
