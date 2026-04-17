import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";

export async function GET() {
  return withAuth(async (ctx) => {
    const notifications = await prisma.notification.findMany({
      where: { tenantId: ctx.tenantId, userId: ctx.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return jsonOk(notifications);
  });
}
