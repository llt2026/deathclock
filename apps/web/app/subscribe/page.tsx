"use client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";

const ENV = process.env.NEXT_PUBLIC_PAYPAL_ENV || "sandbox";
const CLIENT_ID = ENV === "live"
  ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE || ""
  : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX || "AV8nIEzMhHFzKj3o5Fb6I-xULHAuUMGrHDXNQLv9NWw--4k0iKzQmjGSGMD3aDEm2wAJY5sAXjzEg3GI";
const PLAN_ID = ENV === "live"
  ? process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_LIVE || ""
  : process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_SANDBOX || "P-5ML4271244454362WXNWU5NQ";

export default function SubscribePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { user, deviceId } = useAuthStore();

  // 生成用户标识符：优先使用真实用户ID，否则使用设备ID
  const customId = user?.id || deviceId || `guest-${Date.now()}`;

  // 调试信息
  console.log("PayPal Config:", { ENV, CLIENT_ID: CLIENT_ID.substring(0, 10) + "...", PLAN_ID, customId });

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-display mb-2">Upgrade to Pro</h1>
        <p className="text-accent mb-4">$3.99 per month – Unlock unlimited simulations & 1GB Vault storage</p>
        <p className="text-xs text-gray-500">Environment: {ENV} | Client ID: {CLIENT_ID.substring(0, 10)}...</p>
      </div>

      <PayPalScriptProvider options={{ "client-id": CLIENT_ID, currency: "USD", intent: "subscription", vault: true } as any}>
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", color: "gold" }}
          fundingSource={undefined}
          createSubscription={(data: any, actions: any) => {
            return actions.subscription.create({
              plan_id: PLAN_ID,
              custom_id: customId, // 使用动态生成的用户标识符
            });
          }}
          onApprove={async (data: any, actions: any) => {
            router.push("/subscribe/success");
          }}
          onError={(err: any) => {
            console.error(err);
            setError("Payment failed. Please try again.");
          }}
        />
      </PayPalScriptProvider>

      {error && <p className="text-primary text-sm">{error}</p>}

      <button onClick={() => router.push("/")} className="text-accent hover:text-white transition mt-4">
        ← Back to Home
      </button>
    </main>
  );
} 