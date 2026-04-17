import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";
import { transactionSchema } from "@/lib/validation/finance";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withAuth(async (ctx) => {
    const { id } = await params;
    const body = await request.json();
    const parsed = transactionSchema.partial().safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body");

    const payload = parsed.data;
    const updated = await prisma.transaction.updateMany({
      where: { id, tenantId: ctx.tenantId },
      data: {
        ...(payload.accountId ? { accountId: payload.accountId } : {}),
        ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
        ...(payload.type ? { type: payload.type } : {}),
        ...(payload.amountCents ? { amountCents: payload.amountCents } : {}),
        ...(payload.note !== undefined ? { note: payload.note } : {}),
        ...(payload.occurredAt ? { occurredAt: new Date(payload.occurredAt) } : {}),
      },
    });
    if (!updated.count) return jsonError("Transaction not found", 404);
    return jsonOk({ updated: true });
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async (ctx) => {
    const { id } = await params;
    const deleted = await prisma.transaction.deleteMany({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!deleted.count) return jsonError("Transaction not found", 404);
    return jsonOk({ deleted: true });
  });
}
