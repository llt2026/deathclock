import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "../../../../../api/_utils/db";
import { subscriptions } from "../../../../../../packages/db/schema";
import { eq } from "drizzle-orm";
import { users } from "../../../../../../packages/db/schema";

export const runtime = "nodejs"; // ensure Node runtime for crypto.verify

const PAYPAL_BASE_URL = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api.sandbox.paypal.com";

async function fetchPayPalCert(certId: string): Promise<string | null> {
  try {
    const res = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/certs/${certId}`);
    if (!res.ok) {
      console.error("PayPal cert fetch failed", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { cert: string };
    return data.cert;
  } catch (err) {
    console.error("Fetch cert error", err);
    return null;
  }
}

async function verifyPayPalSignature(headers: Headers, body: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn("PAYPAL_WEBHOOK_ID not set, skipping signature check");
    return true; // allow in dev but log warning
  }

  const transmissionId = headers.get("paypal-transmission-id") || "";
  const transmissionTime = headers.get("paypal-transmission-time") || "";
  const certId = headers.get("paypal-cert-id") || "";
  const authAlgo = headers.get("paypal-auth-algo") || "";
  const transmissionSig = headers.get("paypal-transmission-sig") || "";

  if (!transmissionId || !transmissionTime || !certId || !authAlgo || !transmissionSig) {
    console.error("Missing PayPal headers for signature verification");
    return false;
  }

  const certPem = await fetchPayPalCert(certId);
  if (!certPem) return false;

  // SHA256 of body (binary hex)
  const hash = crypto.createHash("sha256").update(body, "utf8").digest("hex");
  const expected = [transmissionId, transmissionTime, webhookId, hash].join("|");

  const algorithm = authAlgo.replace("with", "-"); // e.g., SHA256withRSA -> SHA256-RSA -> RSA-SHA256
  const verifyAlgo = algorithm.includes("RSA") ? "RSA-SHA256" : algorithm;

  const verifier = crypto.createVerify(verifyAlgo as any);
  verifier.update(expected, "utf8");

  try {
    const valid = verifier.verify(certPem, transmissionSig, "base64");
    if (!valid) console.error("PayPal signature invalid");
    return valid;
  } catch (err) {
    console.error("Signature verify threw", err);
    return false;
  }
}

// 仅支持 POST
export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();

    // 可通过环境变量控制是否强制验签
    const mustVerify = process.env.PAYPAL_VERIFY_SIG === "true";
    if (mustVerify) {
      const isValid = await verifyPayPalSignature(request.headers, bodyText);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("[PayPal] Signature verification skipped (PAYPAL_VERIFY_SIG!=true)");
    }

    const event = JSON.parse(bodyText);

    const db = getDb();

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.CREATED":
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.PAYMENT.COMPLETED": { // Treat created/activated/payment as active
        const sub = event.resource;
        const customId = sub.custom_id as string | undefined;
        if (!customId) return NextResponse.json({ error: "Missing custom_id" }, { status: 400 });

        // Ensure user row exists (may be guest checkout without prior sync)
        try {
          await db.insert(users).values({ id: customId, email: `${customId}@placeholder.local` } as any).onConflictDoNothing();
        } catch (e) {
          // ignore if schema mismatch or other error
          console.warn("Insert user ignored", e);
        }

        const renewAtIso: string | undefined = sub.billing_info?.next_billing_time;

        await db
          .insert(subscriptions)
          .values({
            userId: customId,
            tier: "Plus",
            renewAt: renewAtIso ? renewAtIso.split("T")[0] : undefined,
            platform: "paypal",
            isActive: true,
          } as any)
          .onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
              tier: "Plus",
              renewAt: renewAtIso ? renewAtIso.split("T")[0] : undefined,
              isActive: true,
            } as any,
          });
        break;
      }
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const sub = event.resource;
        const customId = sub.custom_id as string | undefined;
        if (customId) {
          await db.update(subscriptions).set({ isActive: false } as any).where(eq(subscriptions.userId, customId));
        }
        break;
      }
      default:
        // 其他事件直接返回 200
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
} 