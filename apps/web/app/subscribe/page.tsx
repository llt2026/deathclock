"use client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { trackSubscriptionStart } from "../../lib/analytics";
import { handleError, ErrorType } from "../../lib/error-handler";

const ENV = process.env.NODE_ENV === 'production' ? "live" : "sandbox";
const CLIENT_ID = ENV === "live"
  ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE || ""
  : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX || "AV8nIEzMhHFzKj3o5Fb6I-xULHAuUMGrHDXNQLv9NWw--4k0iKzQmjGSGMD3aDEm2wAJY5sAXjzEg3GI";
const PLAN_ID = ENV === "live"
  ? process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_LIVE || ""
  : process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_SANDBOX || "P-5ML4271244454362WXNWU5NQ";

export default function SubscribePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { getAppUser, deviceId } = useAuthStore();
  const user = getAppUser();

  // 生成用户标识符：优先使用真实用户ID，否则使用设备ID
  const customId = user?.id || deviceId || `guest-${Date.now()}`;

  // 调试信息
  console.log("PayPal Config:", { ENV, CLIENT_ID: CLIENT_ID.substring(0, 10) + "...", PLAN_ID, customId });

  const onApprove = async (data: any) => {
    try {
      setIsProcessing(true);
      
      // 埋点：订阅开始
      trackSubscriptionStart(PLAN_ID);
      
      console.log("Subscription approved:", data);
      
      // 跳转到成功页面
      router.push("/subscribe/success");
      
    } catch (error) {
      handleError(
        ErrorType.SUBSCRIPTION_FAILED,
        "Failed to process subscription",
        { debug_id: data.subscriptionID, error }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const onError = (err: any) => {
    console.error("PayPal error:", err);
    setError("Payment failed. Please try again.");
    
    handleError(
      ErrorType.SUBSCRIPTION_FAILED,
      "PayPal payment failed",
      err
    );
  };

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-primary mb-4">
            Upgrade to Plus
          </h1>
          <p className="text-accent">
            $3.99 per month – Unlock unlimited simulations & 1GB Vault storage
          </p>
          <p className="text-xs text-gray-500 mt-2">Environment: {ENV} | Client ID: {CLIENT_ID.substring(0, 10)}...</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-semibold text-primary">Plus Plan</h3>
            <div className="text-4xl font-display text-white mt-2">
              $3.99<span className="text-lg text-accent">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <span className="text-success mr-2">✓</span>
              <span className="text-sm">Unlimited life extension simulations</span>
            </li>
            <li className="flex items-center">
              <span className="text-success mr-2">✓</span>
              <span className="text-sm">Advanced longevity tracking</span>
            </li>
            <li className="flex items-center">
              <span className="text-success mr-2">✓</span>
              <span className="text-sm">Priority customer support</span>
            </li>
            <li className="flex items-center">
              <span className="text-success mr-2">✓</span>
              <span className="text-sm">Extended Legacy Vault storage (1GB)</span>
            </li>
          </ul>

          {CLIENT_ID ? (
            <PayPalScriptProvider 
              options={{ 
                clientId: CLIENT_ID,
                currency: "USD", 
                intent: "subscription", 
                vault: true 
              } as any}
            >
              <PayPalButtons
                style={{ layout: "vertical", shape: "rect", color: "gold" }}
                disabled={isProcessing}
                createSubscription={(data, actions) => {
                  return actions.subscription.create({
                    plan_id: PLAN_ID,
                    custom_id: customId,
                  });
                }}
                onApprove={onApprove}
                onError={onError}
              />
            </PayPalScriptProvider>
          ) : (
            <div className="text-center p-4 bg-red-900/20 border border-red-600 rounded-lg">
              <p className="text-red-400 text-sm">PayPal configuration missing</p>
              <p className="text-xs text-gray-500 mt-1">Check environment variables</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="text-center mb-4">
            <p className="text-yellow-400 text-sm">Processing subscription...</p>
          </div>
        )}

        <div className="text-center space-y-4">
          <button
            onClick={() => router.push("/result")}
            className="w-full py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Continue with Free Plan
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Cancel anytime. No hidden fees.</p>
          <p>Billing handled securely by PayPal.</p>
        </div>
      </div>
    </div>
  );
} 