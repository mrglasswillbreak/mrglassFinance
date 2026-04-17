import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";
import { categorySchema } from "@/lib/validation/finance";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withAuth(async (ctx) => {
    const { id } = await params;
    const body = await request.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body");

    const updated = await prisma.category.updateMany({
      where: { id, tenantId: ctx.tenantId },
      data: parsed.data,
    });
    if (!updated.count) return jsonError("Category not found", 404);
    return jsonOk({ updated: true });
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async (ctx) => {
    const { id } = await params;
    const used = await prisma.transaction.count({
      where: { tenantId: ctx.tenantId, categoryId: id },
    });
    if (used > 0) {
      const archived = await prisma.category.updateMany({
        where: { id, tenantId: ctx.tenantId },
        data: { isArchived: true },
      });
      if (!archived.count) return jsonError("Category not found", 404);
      return jsonOk({ archived: true });
    }

    const deleted = await prisma.category.deleteMany({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!deleted.count) return jsonError("Category not found", 404);
    return jsonOk({ deleted: true });
  });
}
