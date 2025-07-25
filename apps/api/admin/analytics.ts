import { getDb } from "../_utils/db";
import { users, deathPrediction, legacyVault, subscriptions } from "../../../packages/db/schema";
import { count, sql, eq, desc, gte } from "drizzle-orm";

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
    const now = new Date();
    
    // 计算时间段
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // 获取基础统计
    const [
      totalUsers,
      usersLast7Days,
      usersLast30Days,
      totalPredictions,
      predictionsLast7Days,
      totalVaultItems,
      vaultLast7Days,
      totalSubscriptions,
      activeSubscriptions,
      subscriptionsLast7Days,
    ] = await Promise.all([
      // 用户统计
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, last7Days)),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, last30Days)),
      
      // 预测统计
      db.select({ count: count() }).from(deathPrediction),
      db.select({ count: count() }).from(deathPrediction).where(gte(deathPrediction.createdAt, last7Days)),
      
      // Vault 统计
      db.select({ count: count() }).from(legacyVault),
      db.select({ count: count() }).from(legacyVault).where(gte(legacyVault.createdAt, last7Days)),
      
      // 订阅统计
      db.select({ count: count() }).from(subscriptions),
      db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.isActive, true)),
      db.select({ count: count() }).from(subscriptions).where(gte(subscriptions.createdAt, last7Days)),
    ]);

    // 获取每日注册趋势 (最近30天)
    const dailyRegistrations = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count()
      })
      .from(users)
      .where(gte(users.createdAt, last30Days))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // 获取每日预测趋势 (最近30天)
    const dailyPredictions = await db
      .select({
        date: sql<string>`DATE(${deathPrediction.createdAt})`,
        count: count()
      })
      .from(deathPrediction)
      .where(gte(deathPrediction.createdAt, last30Days))
      .groupBy(sql`DATE(${deathPrediction.createdAt})`)
      .orderBy(sql`DATE(${deathPrediction.createdAt})`);

    // 计算转化率
    const conversionRates = {
      signupToSubscription: totalUsers[0].count > 0 ? 
        (Number(activeSubscriptions[0].count) / Number(totalUsers[0].count) * 100).toFixed(2) : "0",
      predictionToSignup: totalPredictions[0].count > 0 ? 
        (Number(totalUsers[0].count) / Number(totalPredictions[0].count) * 100).toFixed(2) : "0",
      signupToVault: totalUsers[0].count > 0 ? 
        (Number(totalVaultItems[0].count) / Number(totalUsers[0].count) * 100).toFixed(2) : "0",
    };

    // 预估月收入 (假设平均订阅价格)
    const estimatedMRR = Number(activeSubscriptions[0].count) * 9.99; // 假设平均价格

    const analyticsData = {
      success: true,
      data: {
        overview: {
          totalUsers: totalUsers[0].count,
          totalPredictions: totalPredictions[0].count,
          totalVaultItems: totalVaultItems[0].count,
          totalSubscriptions: totalSubscriptions[0].count,
          activeSubscriptions: activeSubscriptions[0].count,
          estimatedMRR: estimatedMRR,
        },
        growth: {
          usersLast7Days: usersLast7Days[0].count,
          usersLast30Days: usersLast30Days[0].count,
          predictionsLast7Days: predictionsLast7Days[0].count,
          vaultLast7Days: vaultLast7Days[0].count,
          subscriptionsLast7Days: subscriptionsLast7Days[0].count,
        },
        conversion: conversionRates,
        trends: {
          dailyRegistrations: dailyRegistrations,
          dailyPredictions: dailyPredictions,
        },
        // 注意：Vercel Analytics 和 TikTok Events 数据需要通过各自的 API 获取
        // 这里提供占位符，实际数据需要通过客户端 JavaScript 获取
        externalAnalytics: {
          vercelAnalytics: {
            note: "Vercel Analytics data available via @vercel/analytics dashboard or API",
            pageViews: null, // 需要客户端获取
            uniqueVisitors: null,
            topPages: null,
          },
          tiktokEvents: {
            note: "TikTok Events data available via TikTok Events Manager or API",
            pixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || null,
            events: null, // 需要客户端或服务端 API 调用
          }
        }
      }
    };

    return new Response(JSON.stringify(analyticsData), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  } catch (error) {
    console.error("Analytics API error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: "Failed to fetch analytics data",
      details: error.message 
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 