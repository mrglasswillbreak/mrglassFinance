import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";
import { accountSchema } from "@/lib/validation/finance";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withAuth(async (ctx) => {
    const { id } = await params;
    const body = await request.json();
    const parsed = accountSchema.partial().safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body");

    const updated = await prisma.account.updateMany({
      where: { id, tenantId: ctx.tenantId },
      data: parsed.data,
    });
    if (!updated.count) return jsonError("Account not found", 404);
    return jsonOk({ updated: true });
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async (ctx) => {
    const { id } = await params;
    const updated = await prisma.account.updateMany({
      where: { id, tenantId: ctx.tenantId },
      data: { isArchived: true },
    });
    if (!updated.count) return jsonError("Account not found", 404);
    return jsonOk({ deleted: true });
  });
}
