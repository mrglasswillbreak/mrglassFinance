import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonCreated, jsonError, withErrorHandling } from "@/lib/http";
import { registerSchema } from "@/lib/validation/auth";
import {
  generateRefreshToken,
  hashToken,
  setAuthCookies,
  signAccessToken,
} from "@/lib/auth/tokens";

export async function POST(request: Request) {
  return withErrorHandling(async () => {
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

    const created = await prisma.tenant.create({
      data: {
        name: tenantName,
        members: {
          create: {
            role: "OWNER",
            user: {
              create: { email, passwordHash, fullName },
            },
          },
        },
        accounts: {
          create: {
            name: "Main Account",
            type: "BANK",
            currency: "USD",
          },
        },
        categories: {
          create: [
            { name: "Salary", type: "INCOME", isDefault: true, color: "#16a34a" },
            { name: "Food", type: "EXPENSE", isDefault: true, color: "#f59e0b" },
            { name: "Transportation", type: "EXPENSE", isDefault: true, color: "#3b82f6" },
          ],
        },
      },
      select: {
        members: {
          take: 1,
          select: {
            tenantId: true,
            role: true,
            user: { select: { id: true, email: true } },
          },
        },
      },
    });
    const membership = created.members[0];
    if (!membership) {
      return jsonError("Failed to complete registration", 500);
    }

    const accessToken = await signAccessToken({
      sub: membership.user.id,
      tenantId: membership.tenantId,
      role: membership.role,
    });
    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        userId: membership.user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await setAuthCookies(accessToken, refreshToken);

    return jsonCreated({
      user: { id: membership.user.id, email: membership.user.email },
      requiresOnboarding: true,
    });
  });
}
