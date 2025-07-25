import { getDb } from "../_utils/db";
import { users, deathPrediction, legacyVault, subscriptions } from "../../../packages/db/schema";
import { eq, count, desc } from "drizzle-orm";

export const config = { runtime: "nodejs" };

// 简单的管理员身份验证 (生产环境需要更强的验证)
function isAdmin(authHeader: string | null): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN || 'supersecret';
  return authHeader === `Bearer ${adminToken}`;
}

export default async function handler(request: Request): Promise<Response> {
  // 验证管理员权限
  const authHeader = request.headers.get('Authorization');
  if (!isAdmin(authHeader)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = getDb();
  const url = new URL(request.url);

  try {
    switch (request.method) {
      case "GET":
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        // 获取用户列表和统计信息
        const [usersList, totalUsers] = await Promise.all([
          db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
          db.select({ count: count() }).from(users)
        ]);

        // 为每个用户获取相关统计
        const usersWithStats = await Promise.all(
          usersList.map(async (user) => {
            const [predictionCount, vaultCount, subscriptionCount] = await Promise.all([
              db.select({ count: count() }).from(deathPrediction).where(eq(deathPrediction.userId, user.id)),
              db.select({ count: count() }).from(legacyVault).where(eq(legacyVault.userId, user.id)),
              db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.userId, user.id))
            ]);

            return {
              ...user,
              stats: {
                predictions: predictionCount[0].count,
                vaultItems: vaultCount[0].count,
                subscriptions: subscriptionCount[0].count,
              }
            };
          })
        );

        return new Response(JSON.stringify({
          success: true,
          users: usersWithStats,
          pagination: {
            page,
            limit,
            total: totalUsers[0].count,
            totalPages: Math.ceil(Number(totalUsers[0].count) / limit),
          }
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });

      case "DELETE":
        // 删除用户 (管理员操作)
        const userId = url.searchParams.get('userId');
        if (!userId) {
          return new Response("Missing userId parameter", { status: 400 });
        }

        // 级联删除用户相关数据
        await Promise.all([
          db.delete(legacyVault).where(eq(legacyVault.userId, userId)),
          db.delete(deathPrediction).where(eq(deathPrediction.userId, userId)),
          db.delete(subscriptions).where(eq(subscriptions.userId, userId)),
        ]);

        const deletedUser = await db.delete(users).where(eq(users.id, userId)).returning();

        if (!deletedUser.length) {
          return new Response("User not found", { status: 404 });
        }

        return new Response(JSON.stringify({
          success: true,
          message: "User and all related data deleted successfully"
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });

      default:
        return new Response("Method Not Allowed", { status: 405 });
    }
  } catch (error) {
    console.error("Admin users API error:", error);
    return new Response(JSON.stringify({ 
      error: "Operation failed",
      details: error.message 
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 