import { prisma } from "@/lib/prisma";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";
import { accountSchema } from "@/lib/validation/finance";

export async function GET() {
  return withAuth(async (ctx) => {
    const accounts = await prisma.account.findMany({
      where: { tenantId: ctx.tenantId, isArchived: false },
      orderBy: { createdAt: "asc" },
    });
    return jsonOk(accounts);
  });
}

export async function POST(request: Request) {
  return withAuth(async (ctx) => {
    const body = await request.json();
    const parsed = accountSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body");

    const created = await prisma.account.create({
      data: {
        tenantId: ctx.tenantId,
        ...parsed.data,
      },
    });
    return jsonCreated(created);
  });
}
