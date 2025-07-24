"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/auth";

export default function AuthProcessingScreen() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const router = useRouter();
  const { initAuth, user } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        await initAuth();
        // 检查 URL 中的认证参数
        const params = new URLSearchParams(window.location.search);
        if (params.get('access_token')) {
          setStatus("success");
          setTimeout(() => {
            router.push("/vault");
          }, 2000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        setStatus("error");
      }
    };

    handleAuthCallback();
  }, [initAuth, router]);

  if (status === "loading") {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-accent">Verifying your email...</p>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-display mb-2">Welcome Back!</h1>
          <p className="text-accent">You're successfully signed in.</p>
        </div>
        <p className="text-sm text-gray-400">Redirecting you to your account...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-display mb-2">Verification Failed</h1>
        <p className="text-accent mb-6">
          The magic link has expired or is invalid.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/auth/request")}
            className="px-6 py-3 bg-primary text-white rounded-md hover:opacity-90 transition"
          >
            Request New Link
          </button>
          <button
            onClick={() => router.push("/")}
            className="block w-full px-4 py-2 text-accent hover:text-white transition"
          >
            ← Continue as Guest
          </button>
        </div>
      </div>
    </main>
  );
} 