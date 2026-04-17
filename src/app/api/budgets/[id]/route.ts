import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";
import { budgetSchema } from "@/lib/validation/finance";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withAuth(async (ctx) => {
    const { id } = await params;
    const body = await request.json();
    const parsed = budgetSchema.partial().safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body");

    const updated = await prisma.budget.updateMany({
      where: { id, tenantId: ctx.tenantId },
      data: {
        ...(parsed.data.categoryId !== undefined ? { categoryId: parsed.data.categoryId } : {}),
        ...(parsed.data.accountId !== undefined ? { accountId: parsed.data.accountId } : {}),
        ...(parsed.data.periodMonth ? { periodMonth: new Date(parsed.data.periodMonth) } : {}),
        ...(parsed.data.limitCents ? { limitCents: parsed.data.limitCents } : {}),
        ...(parsed.data.alertThresholdPct ? { alertThresholdPct: parsed.data.alertThresholdPct } : {}),
      },
    });
    if (!updated.count) return jsonError("Budget not found", 404);
    return jsonOk({ updated: true });
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async (ctx) => {
    const { id } = await params;
    const deleted = await prisma.budget.deleteMany({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!deleted.count) return jsonError("Budget not found", 404);
    return jsonOk({ deleted: true });
  });
}
