import { prisma } from "@/lib/prisma";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";
import { categorySchema } from "@/lib/validation/finance";

export async function GET() {
  return withAuth(async (ctx) => {
    const categories = await prisma.category.findMany({
      where: { tenantId: ctx.tenantId, isArchived: false },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
    return jsonOk(categories);
  });
}

export async function POST(request: Request) {
  return withAuth(async (ctx) => {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body");

    try {
      const created = await prisma.category.create({
        data: { tenantId: ctx.tenantId, ...parsed.data },
      });
      return jsonCreated(created);
    } catch {
      return jsonError("Category already exists", 409);
    }
  });
}
