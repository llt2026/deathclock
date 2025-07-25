import { getDb } from "../_utils/db";
import { subscriptions } from "../../../packages/db/schema";
import { eq, desc } from "drizzle-orm";

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
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.renewAt))
      .limit(1);

    // 检查订阅状态
    let status = 'free';
    let tier = 'Free';
    let renewAt = null;
    let isActive = false;

    if (subscription.length > 0) {
      const sub = subscription[0];
      tier = sub.tier;
      renewAt = sub.renewAt;
      isActive = sub.isActive;

      // 检查是否过期
      if (sub.isActive && sub.renewAt) {
        const renewDate = new Date(sub.renewAt);
        const now = new Date();
        
        if (renewDate > now) {
          status = 'active';
        } else {
          status = 'expired';
          isActive = false;
        }
      } else if (sub.isActive) {
        status = 'active';
      } else {
        status = 'cancelled';
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      subscription: {
        status,
        tier,
        isActive,
        renewAt,
        platform: subscription.length > 0 ? subscription[0].platform : null,
      }
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  } catch (error) {
    console.error("Subscription status error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch subscription status",
      details: error.message 
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 