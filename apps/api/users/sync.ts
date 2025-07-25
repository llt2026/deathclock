import { getDb } from "../_utils/db";
import { users } from "../../../packages/db/schema";
import { eq } from "drizzle-orm";

export const config = { runtime: "nodejs" };

interface SyncUserRequest {
  id: string;
  email: string;
  display_name?: string;
  dob?: string;
  sex?: 'male' | 'female';
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body: SyncUserRequest = await request.json();
    const { id, email, display_name, dob, sex } = body;

    if (!id || !email) {
      return new Response("Missing required fields: id, email", { status: 400 });
    }

    const db = getDb();

    // 使用 upsert 模式：先尝试插入，如果存在则更新
    const result = await db
      .insert(users)
      .values({
        id,
        email,
        displayName: display_name,
        dob: dob ? new Date(dob).toISOString().split('T')[0] : null,
        sex,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email,
          displayName: display_name,
          dob: dob ? new Date(dob).toISOString().split('T')[0] : null,
          sex,
        },
      })
      .returning();

    return new Response(JSON.stringify({ 
      success: true, 
      user: result[0] 
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  } catch (error) {
    console.error("User sync error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to sync user",
      details: error.message 
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 