import { getDb } from "../_utils/db";
import { users, deathPrediction, legacyVault, subscriptions } from "../../../packages/db/schema";
import { count, sql, eq } from "drizzle-orm";

export const config = { runtime: "nodejs" };

// 简单的管理员身份验证
function isAdmin(authHeader: string | null): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN || 'supersecret';
  return authHeader === `Bearer ${adminToken}`;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 验证管理员权限
  const authHeader = request.headers.get('Authorization');
  if (!isAdmin(authHeader)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const db = getDb();

    // 获取基础统计信息
    const [
      totalUsers,
      totalPredictions,
      totalVaultItems,
      totalSubscriptions,
      activeSubscriptions,
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(deathPrediction),
      db.select({ count: count() }).from(legacyVault),
      db.select({ count: count() }).from(subscriptions),
      db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.isActive, true)),
    ]);

    // 获取最近30天的新用户数
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${thirtyDaysAgo.toISOString()}`);

    // 获取订阅层级分布
    const subscriptionTiers = await db
      .select({ 
        tier: subscriptions.tier,
        count: count() 
      })
      .from(subscriptions)
      .where(eq(subscriptions.isActive, true))
      .groupBy(subscriptions.tier);

    // 获取 Vault 类型分布
    const vaultTypes = await db
      .select({ 
        type: legacyVault.type,
        count: count() 
      })
      .from(legacyVault)
      .groupBy(legacyVault.type);

    return new Response(JSON.stringify({
      success: true,
      stats: {
        users: {
          total: totalUsers[0].count,
          recent30Days: recentUsers[0].count,
        },
        predictions: {
          total: totalPredictions[0].count,
        },
        vault: {
          total: totalVaultItems[0].count,
          byType: vaultTypes.reduce((acc, item) => {
            acc[item.type] = item.count;
            return acc;
          }, {} as Record<string, any>),
        },
        subscriptions: {
          total: totalSubscriptions[0].count,
          active: activeSubscriptions[0].count,
          byTier: subscriptionTiers.reduce((acc, item) => {
            acc[item.tier] = item.count;
            return acc;
          }, {} as Record<string, any>),
        },
        revenue: {
          // TODO: 计算收入统计
          estimatedMonthlyRevenue: Number(activeSubscriptions[0].count) * 9.99, // 假设平均价格
        }
      }
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  } catch (error) {
    console.error("Admin stats API error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch statistics",
      details: error.message 
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 