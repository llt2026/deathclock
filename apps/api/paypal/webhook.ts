import { getDb } from "../_utils/db";
import { subscriptions } from "../../../packages/db/schema";
import { eq } from "drizzle-orm";

export const config = { runtime: "nodejs" }; // 需要 Node.js 运行时进行 RSA 验签

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // 1. 读取原始请求体（用于验签）
    const rawBody = await request.text();
    const headers = request.headers;

    // 2. 获取 PayPal 环境配置
    const ENV = process.env.NEXT_PUBLIC_PAYPAL_ENV || "sandbox";
    const urlBase = ENV === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
    
    const clientId = ENV === "live"
      ? process.env.PAYPAL_CLIENT_ID_LIVE
      : process.env.PAYPAL_CLIENT_ID_SANDBOX;
    
    const clientSecret = ENV === "live"
      ? process.env.PAYPAL_CLIENT_SECRET_LIVE
      : process.env.PAYPAL_CLIENT_SECRET_SANDBOX;

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    if (!clientId || !clientSecret || !webhookId) {
      console.error("Missing PayPal credentials");
      return new Response("Server configuration error", { status: 500 });
    }

    // 3. 获取 PayPal 访问令牌
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const authResponse = await fetch(`${urlBase}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authString}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      console.error("Failed to get PayPal access token");
      return new Response("PayPal authentication failed", { status: 500 });
    }

    const { access_token } = await authResponse.json();

    // 4. 验证 Webhook 签名
    const verifyData = {
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_time: headers.get("paypal-transmission-time"),
      cert_url: headers.get("paypal-cert-url"),
      auth_algo: headers.get("paypal-auth-algo"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    };

    const verifyResponse = await fetch(`${urlBase}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
      body: JSON.stringify(verifyData),
    });

    if (!verifyResponse.ok) {
      console.error("Webhook verification failed", await verifyResponse.text());
      return new Response("Webhook verification failed", { status: 400 });
    }

    const { verification_status } = await verifyResponse.json();
    if (verification_status !== "SUCCESS") {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }

    // 5. 处理 Webhook 事件
    const event = JSON.parse(rawBody);
    console.log("Processing PayPal event:", event.event_type, event.id);

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.RENEWED":
        await handleSubscriptionActivated(event);
        break;
      
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await handleSubscriptionCancelled(event);
        break;
      
      case "PAYMENT.SALE.COMPLETED":
        await handlePaymentCompleted(event);
        break;
      
      default:
        console.log("Unhandled event type:", event.event_type);
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

async function handleSubscriptionActivated(event: any) {
  const resource = event.resource;
  const subscriptionId = resource.id;
  const customId = resource.custom_id || resource.subscriber?.payer_id;
  
  // 根据产品文档，使用 custom_id 作为 user_id（supabase_uid）
  if (!customId) {
    console.error("No custom_id found in subscription event");
    return;
  }

  try {
    const db = getDb();
    const renewDate = resource.billing_info?.next_billing_time 
      ? new Date(resource.billing_info.next_billing_time).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 使用 upsert 模式：先尝试插入，如果冲突则更新
    await db
      .insert(subscriptions)
      .values({
        userId: customId,
        tier: "Pro",
        platform: "paypal",
        isActive: true,
        renewAt: renewDate,
      })
      .onConflictDoUpdate({
        target: subscriptions.userId, // 使用 userId 作为冲突目标
        set: {
          tier: "Pro",
          isActive: true,
          renewAt: renewDate,
        },
      });

    console.log("Subscription activated:", subscriptionId);
  } catch (error) {
    console.error("Database error in handleSubscriptionActivated:", error);
  }
}

async function handleSubscriptionCancelled(event: any) {
  const resource = event.resource;
  const customId = resource.custom_id || resource.subscriber?.payer_id;

  if (!customId) {
    console.error("No custom_id found in cancellation event");
    return;
  }

  try {
    const db = getDb();
    await db
      .update(subscriptions)
      .set({ isActive: false })
      .where(eq(subscriptions.userId, customId));

    console.log("Subscription cancelled for user:", customId);
  } catch (error) {
    console.error("Database error in handleSubscriptionCancelled:", error);
  }
}

async function handlePaymentCompleted(event: any) {
  const resource = event.resource;
  const customId = resource.custom_id || event.resource?.billing_agreement_id;

  if (customId) {
    try {
      const db = getDb();
      const renewDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // 更新订阅的下次计费时间
      await db
        .update(subscriptions)
        .set({ 
          isActive: true,
          renewAt: renewDate
        })
        .where(eq(subscriptions.userId, customId));

      console.log("Payment completed for user:", customId);
    } catch (error) {
      console.error("Database error in handlePaymentCompleted:", error);
    }
  }
} 