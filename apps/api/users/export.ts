import { getDb } from "../_utils/db";
import { users, deathPrediction, legacyVault, subscriptions } from "../../../packages/db/schema";
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

    // 获取用户所有数据
    const [userData, predictions, vaultItems, userSubscriptions] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(deathPrediction).where(eq(deathPrediction.userId, userId)),
      db.select().from(legacyVault).where(eq(legacyVault.userId, userId)),
      db.select().from(subscriptions).where(eq(subscriptions.userId, userId)),
    ]);

    if (!userData.length) {
      return new Response("User not found", { status: 404 });
    }

    // 构建导出数据
    const exportData = {
      exportDate: new Date().toISOString(),
      user: userData[0],
      predictions: predictions,
      vaultItems: vaultItems.map(item => ({
        ...item,
        // 注意：不包含实际文件内容，仅元数据
        note: "File content available through download API"
      })),
      subscriptions: userSubscriptions,
      summary: {
        totalPredictions: predictions.length,
        totalVaultItems: vaultItems.length,
        totalSubscriptions: userSubscriptions.length,
      }
    };

    // 返回 JSON 格式的数据
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: { 
        "content-type": "application/json",
        "content-disposition": `attachment; filename="moreminutes-data-${userId}-${Date.now()}.json"`,
      },
    });

  } catch (error) {
    console.error("Data export error:", error);
    return new Response(JSON.stringify({ 
      error: "Export failed",
      details: error.message 
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 