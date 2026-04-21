import { getCurrentUser } from "@/lib/auth/session";
import { jsonError, jsonOk, withErrorHandling } from "@/lib/http";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    return jsonOk(user);
  });
}
