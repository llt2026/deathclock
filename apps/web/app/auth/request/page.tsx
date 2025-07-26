"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/auth";
import { toast } from "../../../lib/toast";

export default function AuthRequestPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signInWithMagicLink } = useAuthStore();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithMagicLink(email);
      toast.success("Magic link sent! Check your email.");
      router.push("/auth/verify");
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Sign in to More Minutes</h1>
          <p className="text-accent">
            We&apos;ll send you a secure magic link to access your account
          </p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-4">
            No account? Magic links work for both sign-in and sign-up!
          </p>
          
          <button
            onClick={() => router.back()}
            className="text-accent hover:text-white transition"
          >
            ← Back
          </button>
        </div>

        <div className="mt-8 text-xs text-gray-500 text-center">
          <p>
            By continuing, you agree to our{" "}
            <a href="/legal" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/legal" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </main>
  );
} 