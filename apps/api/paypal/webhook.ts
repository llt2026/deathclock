import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "../_utils/db";
import { subscriptions, users } from "../../../packages/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("paypal-transmission-sig");
    const certId = request.headers.get("paypal-cert-id");
    const timestamp = request.headers.get("paypal-transmission-time");
    const authAlgo = request.headers.get("paypal-auth-algo");

    // 验证 PayPal Webhook 签名
    if (!verifyPayPalSignature(body, signature, certId, timestamp, authAlgo)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const db = getDb();

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.PAYMENT.COMPLETED": {
        const subscription = event.resource;
        const customId = subscription.custom_id; // supabase_uid
        
        if (!customId) {
          console.error("No custom_id in PayPal subscription");
          return NextResponse.json({ error: "Missing custom_id" }, { status: 400 });
        }

        // 更新订阅状态
        await db.insert(subscriptions).values({
          userId: customId,
          tier: "Plus", // 或根据 plan_id 判断
          renewAt: new Date(subscription.billing_info.next_billing_time),
          platform: "paypal",
          isActive: true,
        }).onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            tier: "Plus",
            renewAt: new Date(subscription.billing_info.next_billing_time),
            isActive: true,
          },
        });

        // 埋点：订阅完成
        const amount = parseFloat(subscription.billing_info.last_payment?.amount?.value || "3.99");
        const planId = subscription.plan_id;
        
        // 发送埋点事件到客户端（如果需要）
        console.log(`Subscription completed: user=${customId}, plan=${planId}, amount=${amount}`);
        
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const subscription = event.resource;
        const customId = subscription.custom_id;
        
        if (customId) {
          await db.update(subscriptions)
            .set({ isActive: false })
            .where(eq(subscriptions.userId, customId));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

function verifyPayPalSignature(
  body: string,
  signature: string | null,
  certId: string | null,
  timestamp: string | null,
  authAlgo: string | null
): boolean {
  // PayPal 签名验证逻辑
  // 在生产环境中需要实现完整的验证
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  try {
    // 简化验证，生产环境需要完整实现
    return true;
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
} 