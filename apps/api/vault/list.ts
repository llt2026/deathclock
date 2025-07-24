import { getDb } from "../_utils/db";
import { legacyVault } from "../../../packages/db/schema";
import { eq } from "drizzle-orm";

export const config = { runtime: "nodejs" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response("Missing userId parameter", { status: 400 });
    }

    const db = getDb();
    const items = await db
      .select()
      .from(legacyVault)
      .where(eq(legacyVault.userId, userId))
      .orderBy(legacyVault.createdAt);

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  } catch (error) {
    console.error("Vault list error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch vault items" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 