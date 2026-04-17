import { prisma } from "@/lib/prisma";
import { clearAuthCookies, getRefreshTokenFromCookies, hashToken } from "@/lib/auth/tokens";
import { getAuthContext } from "@/lib/auth/session";
import { jsonOk } from "@/lib/http";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookies();
  const auth = await getAuthContext();

  if (refreshToken && auth) {
    await prisma.refreshToken.updateMany({
      where: { userId: auth.userId, tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  await clearAuthCookies();
  return jsonOk({ success: true });
}
