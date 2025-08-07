export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../api/_utils/db";
import { users, legacyVault, subscriptions, deathPrediction } from "../../../../../../packages/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const db = getDb();
    
    // 获取用户信息
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    // 获取 Vault 项目 (不包含实际文件内容，只有元数据)
    const vaultItems = await db.select().from(legacyVault).where(eq(legacyVault.userId, userId));
    
    // 获取订阅信息
    const userSubscriptions = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    
    // 获取预测记录
    const predictions = await db.select().from(deathPrediction).where(eq(deathPrediction.userId, userId));

    const exportData = {
      user: user[0] || null,
      vaultItems: vaultItems.map(item => ({
        ...item,
        note: "Actual file content not included for privacy"
      })),
      subscriptions: userSubscriptions,
      predictions,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    return new Response(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="moreminutes-data-${userId}-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (e: any) {
    console.error("Export error:", e);
    return NextResponse.json({ error: "Failed to export data", details: e.message }, { status: 500 });
  }
} 