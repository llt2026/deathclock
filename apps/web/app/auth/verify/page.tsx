"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/auth";

export default function AuthVerifyPage() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      setStatus("success");
      setTimeout(() => {
        router.push("/settings");
      }, 2000);
    }
  }, [user, router]);

  return (
    <main className="flex items-center justify-center min-h-screen p-6">
      <div className="text-center max-w-md">
        {status === "verifying" && (
          <>
            <div className="text-6xl mb-6 animate-spin">⏳</div>
            <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
            <p className="text-accent mb-8">
              Please check your email and click the magic link to continue.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                This page will automatically redirect once you click the link.
              </p>
              <button
                onClick={() => router.push("/auth/request")}
                className="text-primary hover:underline"
              >
                Didn&apos;t receive the email? Send another
              </button>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
            <p className="text-accent mb-4">
              We&apos;ve sent a secure link to your email.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting you to your settings...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-2xl font-bold mb-4">Verification failed</h1>
            <p className="text-accent mb-8">
              The magic link may have expired or is invalid.
            </p>
            <button
              onClick={() => router.push("/auth/request")}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition"
            >
              Try Again
            </button>
          </>
        )}

        <div className="mt-8">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </main>
  );
} 