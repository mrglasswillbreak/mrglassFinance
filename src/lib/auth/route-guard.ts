import { requireAuthContext } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/http";

type AuthContext = Awaited<ReturnType<typeof requireAuthContext>>;

export async function withAuth(handler: (ctx: AuthContext) => Promise<Response>) {
  return withErrorHandling(async () => handler(await requireAuthContext()));
}
