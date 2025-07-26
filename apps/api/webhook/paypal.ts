import { getDb } from "../_utils/db";
import { subscriptions, tierEnum } from "../../../packages/db/schema";
import { eq } from "drizzle-orm";

export const config = { runtime: "nodejs" };

const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";
const PAYPAL_API = process.env.NODE_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const resp = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const json = await resp.json();
  return json.access_token as string;
}

async function verifySignature(req: Request, body: string, accessToken: string) {
  const headers = req.headers;
  const verifyPayload = {
    auth_algo: headers.get("paypal-auth-algo"),
    cert_url: headers.get("paypal-cert-url"),
    transmission_id: headers.get("paypal-transmission-id"),
    transmission_sig: headers.get("paypal-transmission-sig"),
    transmission_time: headers.get("paypal-transmission-time"),
    webhook_id: WEBHOOK_ID,
    webhook_event: JSON.parse(body),
  };
  const resp = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(verifyPayload),
  });
  const json = await resp.json();
  return json.verification_status === "SUCCESS";
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const rawBody = await request.text();
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  try {
    const token = await getAccessToken();
    const valid = await verifySignature(request, rawBody, token);
    if (!valid) {
      return new Response("Invalid signature", { status: 400 });
    }
  } catch (e) {
    console.error("PayPal verify error", e);
    return new Response("Verification failed", { status: 500 });
  }

  try {
    const db = getDb();
    const { event_type, resource } = event;
    if (!resource) return new Response("No resource", { status: 200 });

    const customId: string | undefined = resource.custom_id || resource.customId;
    if (!customId) return new Response("No custom id", { status: 200 });

    if (event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const planId: string = resource.plan_id;
      const tier = planId === process.env.NEXT_PUBLIC_PAYPAL_PLAN_PRO_ID ? "Pro" : "Plus";
      const renewAt = resource.billing_info?.next_billing_time?.split("T")[0] || null;
      await db
        .insert(subscriptions)
        .values({ userId: customId, tier: tier as typeof tierEnum.$type, isActive: true, renewAt })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: { tier, isActive: true, renewAt },
        });
    }
    if (event_type === "BILLING.SUBSCRIPTION.CANCELLED" || event_type === "BILLING.SUBSCRIPTION.SUSPENDED") {
      await db.update(subscriptions).set({ isActive: false }).where(eq(subscriptions.userId, customId));
    }
    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("Webhook processing error", e);
    return new Response("Server error", { status: 500 });
  }
} 