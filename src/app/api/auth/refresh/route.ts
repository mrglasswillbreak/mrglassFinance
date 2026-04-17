import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import {
  generateRefreshToken,
  getRefreshTokenFromCookies,
  hashToken,
  setAuthCookies,
  signAccessToken,
} from "@/lib/auth/tokens";

export async function POST() {
  const incomingRefreshToken = await getRefreshTokenFromCookies();
  if (!incomingRefreshToken) {
    return jsonError("Unauthorized", 401);
  }

  const hashed = hashToken(incomingRefreshToken);
  const storedToken = await prisma.refreshToken.findFirst({
    where: { tokenHash: hashed, revokedAt: null },
    include: { user: { include: { memberships: true } } },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    return jsonError("Unauthorized", 401);
  }

  const primaryMembership = storedToken.user.memberships[0];
  if (!primaryMembership) {
    return jsonError("No tenant membership found", 403);
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  const nextRefreshToken = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId: storedToken.user.id,
      tokenHash: hashToken(nextRefreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = await signAccessToken({
    sub: storedToken.user.id,
    tenantId: primaryMembership.tenantId,
    role: primaryMembership.role,
  });
  await setAuthCookies(accessToken, nextRefreshToken);

  return jsonOk({ refreshed: true });
}
