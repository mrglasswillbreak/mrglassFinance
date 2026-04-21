import { prisma } from "@/lib/prisma";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";
import { transactionQuerySchema, transactionSchema } from "@/lib/validation/finance";

export async function GET(request: Request) {
  return withAuth(async (ctx) => {
    const searchParams = new URL(request.url).searchParams;
    const parsedQuery = transactionQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      accountId: searchParams.get("accountId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
    });
    if (!parsedQuery.success) return jsonError("Invalid query params");

    const { page, pageSize, accountId, categoryId, type, startDate, endDate } = parsedQuery.data;

    const where = {
      tenantId: ctx.tenantId,
      ...(accountId ? { accountId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(type ? { type } : {}),
      ...(startDate || endDate
        ? {
            occurredAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { account: true, category: true },
        orderBy: { occurredAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    return jsonOk({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  });
}

export async function POST(request: Request) {
  return withAuth(async (ctx) => {
    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body");

    const account = await prisma.account.findFirst({
      where: { id: parsed.data.accountId, tenantId: ctx.tenantId },
    });
    if (!account) return jsonError("Account not found", 404);

    if (parsed.data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: parsed.data.categoryId, tenantId: ctx.tenantId },
      });
      if (!category) return jsonError("Category not found", 404);
    }

    const created = await prisma.transaction.create({
      data: {
        tenantId: ctx.tenantId,
        createdById: ctx.userId,
        accountId: parsed.data.accountId,
        categoryId: parsed.data.categoryId ?? null,
        type: parsed.data.type,
        amountCents: parsed.data.amountCents,
        note: parsed.data.note ?? null,
        occurredAt: new Date(parsed.data.occurredAt),
      },
    });

    return jsonCreated(created);
  });
}
