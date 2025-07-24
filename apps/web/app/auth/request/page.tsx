"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/auth";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthRequestModal() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { signInWithMagicLink } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithMagicLink(email);
      setSent(true);
    } catch (error) {
      setErrorMsg("Failed to send magic link. Please try again later.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-display mb-4">Check Your Email</h1>
          <p className="text-accent mb-6">
            We've sent a magic link to <strong>{email}</strong>. 
            Click the link to sign in instantly.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSent(false)}
              className="w-full px-4 py-2 text-accent hover:text-white transition"
            >
              ← Send to different email
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-display mb-2">Sign In</h1>
        <p className="text-accent">
          Enter your email to receive a magic link. No password required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400"
          />
        </div>

        {errorMsg && <p className="text-primary text-sm">{errorMsg}</p>}

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full px-4 py-3 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 transition font-medium"
        >
          {isLoading ? "Sending..." : "Send Magic Link"}
        </button>
      </form>

      <div className="text-center space-y-3">
        <p className="text-sm text-gray-400">
          By signing in, you agree to our{" "}
          <a href="/legal" className="text-primary hover:underline">
            Terms of Service
          </a>
        </p>
        
        <button
          onClick={() => router.push("/")}
          className="text-accent hover:text-white transition"
        >
          ← Continue without account
        </button>
      </div>
    </main>
  );
} 