import { getCurrentUser } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  return jsonOk(user);
}
