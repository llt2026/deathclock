"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SubscribeFailScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [debugId, setDebugId] = useState<string | null>(null);

  useEffect(() => {
    setDebugId(searchParams.get('debug_id'));
  }, [searchParams]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <div className="text-6xl mb-4">❌</div>
      
      <div className="max-w-md">
        <h1 className="text-3xl font-display mb-4 text-primary">Subscription Failed</h1>
        
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-200 mb-2">
            We couldn't process your subscription. This could be due to:
          </p>
          <ul className="text-sm text-red-300 text-left space-y-1">
            <li>• Payment method declined</li>
            <li>• Insufficient funds</li>
            <li>• Network connection issues</li>
            <li>• PayPal service temporarily unavailable</li>
          </ul>
        </div>

        {debugId && (
          <div className="bg-gray-800 rounded p-3 mb-4">
            <p className="text-xs text-gray-400">Debug ID: {debugId}</p>
            <p className="text-xs text-gray-500 mt-1">
              Please include this ID when contacting support
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push("/subscribe")}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.open("mailto:support@moreminutes.life?subject=Subscription Issue" + (debugId ? `&body=Debug ID: ${debugId}` : ""))}
            className="w-full px-6 py-3 border border-gray-600 text-accent rounded-lg hover:bg-gray-800 transition"
          >
            Contact Support
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="w-full px-4 py-2 text-accent hover:text-white transition"
          >
            ← Continue as Free User
          </button>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500 max-w-sm">
        <p>
          <strong>Need immediate help?</strong> Email us at{" "}
          <a href="mailto:support@moreminutes.life" className="text-primary hover:underline">
            support@moreminutes.life
          </a>
        </p>
        <p className="mt-2">
          We typically respond within 24 hours and will help resolve any payment issues.
        </p>
      </div>
    </main>
  );
} 