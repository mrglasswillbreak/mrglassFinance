import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonCreated, jsonError } from "@/lib/http";
import { registerSchema } from "@/lib/validation/auth";
import {
  generateRefreshToken,
  hashToken,
  setAuthCookies,
  signAccessToken,
} from "@/lib/auth/tokens";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request body");
  }

  const { email, password, fullName, tenantName } = parsed.data;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return jsonError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const tenant = await tx.tenant.create({ data: { name: tenantName } });
    const user = await tx.user.create({
      data: { email, passwordHash, fullName },
    });

    const membership = await tx.tenantMember.create({
      data: { tenantId: tenant.id, userId: user.id, role: "OWNER" },
    });

    await tx.account.create({
      data: {
        tenantId: tenant.id,
        name: "Main Account",
        type: "BANK",
        currency: "USD",
      },
    });

    await tx.category.createMany({
      data: [
        { tenantId: tenant.id, name: "Salary", type: "INCOME", isDefault: true, color: "#16a34a" },
        { tenantId: tenant.id, name: "Food", type: "EXPENSE", isDefault: true, color: "#f59e0b" },
        {
          tenantId: tenant.id,
          name: "Transportation",
          type: "EXPENSE",
          isDefault: true,
          color: "#3b82f6",
        },
      ],
    });

    return { user, membership };
  });

  const accessToken = await signAccessToken({
    sub: created.user.id,
    tenantId: created.membership.tenantId,
    role: created.membership.role,
  });
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: created.user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await setAuthCookies(accessToken, refreshToken);

  return jsonCreated({
    user: { id: created.user.id, email: created.user.email },
    requiresOnboarding: true,
  });
}
