import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  return withAuth(async (ctx) => {
    const { id } = await params;
    const updated = await prisma.notification.updateMany({
      where: { id, tenantId: ctx.tenantId, userId: ctx.userId },
      data: { readAt: new Date() },
    });
    if (!updated.count) return jsonError("Notification not found", 404);
    return jsonOk({ updated: true });
  });
}
