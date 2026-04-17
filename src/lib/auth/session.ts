import { getAccessTokenFromCookies, verifyAccessToken } from "@/lib/auth/tokens";

export type AuthContext = {
  userId: string;
  tenantId: string;
  role: "OWNER" | "MEMBER";
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const token = await getAccessTokenFromCookies();
  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    if (!payload.sub || !payload.tenantId || !payload.role) {
      return null;
    }
    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function requireAuthContext(): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) {
    throw new Error("Unauthorized");
  }
  return context;
}

export async function getCurrentUser() {
  const context = await getAuthContext();
  if (!context) return null;
  const { prisma } = await import("@/lib/prisma");

  return prisma.user.findUnique({
    where: { id: context.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      memberships: {
        where: { tenantId: context.tenantId },
        select: { role: true, tenantId: true, tenant: { select: { name: true, plan: true } } },
      },
    },
  });
}
