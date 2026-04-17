import { format, startOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";

export async function GET() {
  return withAuth(async (ctx) => {
    const now = new Date();
    const months = Array.from({ length: 6 }).map((_, i) => startOfMonth(subMonths(now, 5 - i)));

    const series = await Promise.all(
      months.map(async (monthStart) => {
        const monthEnd = startOfMonth(subMonths(monthStart, -1));
        const txs = await prisma.transaction.findMany({
          where: {
            tenantId: ctx.tenantId,
            occurredAt: {
              gte: monthStart,
              lt: monthEnd,
            },
          },
          select: { type: true, amountCents: true },
        });

        const income = txs
          .filter((tx) => tx.type === "INCOME")
          .reduce((sum, tx) => sum + tx.amountCents, 0);
        const expense = txs
          .filter((tx) => tx.type === "EXPENSE")
          .reduce((sum, tx) => sum + tx.amountCents, 0);

        return {
          month: format(monthStart, "MMM yyyy"),
          incomeCents: income,
          expenseCents: expense,
          netCents: income - expense,
        };
      }),
    );

    return jsonOk(series);
  });
}
