import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";
import { preferenceSchema } from "@/lib/validation/finance";

export async function GET() {
  return withAuth(async (ctx) => {
    const preference = await prisma.userPreference.findUnique({
      where: { userId: ctx.userId },
    });
    return jsonOk(
      preference ?? {
        currency: "USD",
        locale: "en-US",
        theme: "system",
        weekStart: "monday",
      },
    );
  });
}

export async function PATCH(request: Request) {
  return withAuth(async (ctx) => {
    const body = await request.json();
    const parsed = preferenceSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body");

    await prisma.userPreference.upsert({
      where: { userId: ctx.userId },
      update: parsed.data,
      create: { userId: ctx.userId, ...parsed.data },
    });

    return jsonOk({ updated: true });
  });
}
