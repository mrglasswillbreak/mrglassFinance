import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { loginSchema } from "@/lib/validation/auth";
import {
  generateRefreshToken,
  hashToken,
  setAuthCookies,
  signAccessToken,
} from "@/lib/auth/tokens";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid credentials", 400);
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: true, preference: { select: { id: true } } },
  });
  if (!user || !user.isActive) {
    return jsonError("Invalid credentials", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return jsonError("Invalid credentials", 401);
  }

  const primaryMembership = user.memberships[0];
  if (!primaryMembership) {
    return jsonError("No tenant membership found", 403);
  }

  const accessToken = await signAccessToken({
    sub: user.id,
    tenantId: primaryMembership.tenantId,
    role: primaryMembership.role,
  });
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await setAuthCookies(accessToken, refreshToken);

  return jsonOk({
    user: { id: user.id, email: user.email },
    requiresOnboarding: !user.preference,
  });
}
