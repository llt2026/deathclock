export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../api/_utils/db";
import { subscriptions } from "../../../../../../packages/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const db = getDb();
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.renewAt))
      .limit(1);

    // 检查订阅状态
    let status = "free";
    let tier = "Free";
    let renewAt = null;
    let isActive = false;

    if (subscription.length > 0) {
      const sub = subscription[0];
      tier = sub.tier;
      renewAt = sub.renewAt;
      isActive = sub.isActive || false;

      // 检查是否过期
      if (sub.isActive && sub.renewAt) {
        const renewDate = new Date(sub.renewAt);
        const now = new Date();
        
        if (renewDate > now) {
          status = "active";
        } else {
          status = "expired";
          isActive = false;
        }
      } else if (sub.isActive) {
        status = "active";
      } else {
        status = "cancelled";
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          status,
          tier,
          isActive,
          renewAt,
          platform: subscription.length > 0 ? subscription[0].platform : null,
        }
      }
    });

  } catch (e: any) {
    console.error("Subscription status error:", e);
    return NextResponse.json({ error: "Failed to fetch subscription status", details: e.message }, { status: 500 });
  }
} 