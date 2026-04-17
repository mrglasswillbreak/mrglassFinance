import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { withAuth } from "@/lib/auth/route-guard";
import { profileSchema } from "@/lib/validation/finance";

export async function GET() {
  return withAuth(async (ctx) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { id: true, email: true, fullName: true },
    });
    return jsonOk(user);
  });
}

export async function PATCH(request: Request) {
  return withAuth(async (ctx) => {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body");

    await prisma.user.update({
      where: { id: ctx.userId },
      data: { fullName: parsed.data.fullName },
    });
    return jsonOk({ updated: true });
  });
}
