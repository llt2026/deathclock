import { getDb } from "../_utils/db";
import { users } from "../../../packages/db/schema";
import { eq } from "drizzle-orm";

export const config = { runtime: "nodejs" };

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return new Response("Missing userId parameter", { status: 400 });
  }

  const db = getDb();

  try {
    switch (request.method) {
      case "GET":
        // 获取用户资料
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!user.length) {
          return new Response("User not found", { status: 404 });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          user: user[0] 
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });

      case "PUT":
        // 更新用户资料
        const updateData = await request.json();
        const { displayName, dob, sex } = updateData;

        const updatedUser = await db
          .update(users)
          .set({
            displayName,
            dob: dob ? new Date(dob).toISOString().split('T')[0] : null,
            sex,
          })
          .where(eq(users.id, userId))
          .returning();

        if (!updatedUser.length) {
          return new Response("User not found", { status: 404 });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          user: updatedUser[0] 
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });

      case "DELETE":
        // 删除用户账户（软删除 - 实际上可能需要删除相关数据）
        const deletedUser = await db
          .delete(users)
          .where(eq(users.id, userId))
          .returning();

        if (!deletedUser.length) {
          return new Response("User not found", { status: 404 });
        }

        // TODO: 删除相关的预测、订阅、Vault 数据
        // 这里应该级联删除或标记为已删除

        return new Response(JSON.stringify({ 
          success: true, 
          message: "User account deleted successfully" 
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });

      default:
        return new Response("Method Not Allowed", { status: 405 });
    }
  } catch (error) {
    console.error("User profile API error:", error);
    return new Response(JSON.stringify({ 
      error: "Operation failed",
      details: error.message 
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 