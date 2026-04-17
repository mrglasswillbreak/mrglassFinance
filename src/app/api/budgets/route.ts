import { prisma } from "@/lib/prisma";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";
import { budgetSchema } from "@/lib/validation/finance";

export async function GET(request: Request) {
  return withAuth(async (ctx) => {
    const month = new URL(request.url).searchParams.get("month");
    const budgets = await prisma.budget.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...(month ? { periodMonth: new Date(month) } : {}),
      },
      include: { account: true, category: true },
      orderBy: { periodMonth: "desc" },
    });
    return jsonOk(budgets);
  });
}

export async function POST(request: Request) {
  return withAuth(async (ctx) => {
    const body = await request.json();
    const parsed = budgetSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body");

    try {
      const created = await prisma.budget.create({
        data: {
          tenantId: ctx.tenantId,
          categoryId: parsed.data.categoryId ?? null,
          accountId: parsed.data.accountId ?? null,
          periodMonth: new Date(parsed.data.periodMonth),
          limitCents: parsed.data.limitCents,
          alertThresholdPct: parsed.data.alertThresholdPct,
        },
      });
      return jsonCreated(created);
    } catch {
      return jsonError("Budget already exists for this scope and month", 409);
    }
  });
}
