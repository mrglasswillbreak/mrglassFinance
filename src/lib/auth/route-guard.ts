import { jsonError } from "@/lib/http";
import { requireAuthContext } from "@/lib/auth/session";

export async function withAuth<T>(handler: (ctx: Awaited<ReturnType<typeof requireAuthContext>>) => Promise<T>) {
  try {
    return await handler(await requireAuthContext());
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401) as T;
    }
    throw error;
  }
}
