"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/auth";
import { trackEvent } from "../../../lib/analytics";

export default function SubscribeSuccessPage() {
  const router = useRouter();
  const { getAppUser } = useAuthStore();
  const user = getAppUser();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Track subscription success
    trackEvent("subscription_success_viewed", {
      user_id: user?.id || "guest",
      timestamp: new Date().toISOString()
    });

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleContinue = (destination: string) => {
    trackEvent("post_subscription_navigation", { destination });
    router.push(destination);
  };

  return (
    <main className="min-h-screen bg-dark text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                color: Math.random() > 0.5 ? '#E50914' : '#00C48C'
              }}
            >
              {Math.random() > 0.5 ? '🎉' : '✨'}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Success Header */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-4xl md:text-5xl font-display text-success mb-4">
            Welcome to Plus!
          </h1>
          <p className="text-xl text-accent">
            Your subscription is now active. You've unlocked powerful new features to live more intentionally.
          </p>
        </div>

        {/* Features Unlocked */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">What You've Unlocked</h2>
          
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <span className="text-success text-xl">🚀</span>
              <div>
                <h3 className="font-semibold text-white">Unlimited Simulations</h3>
                <p className="text-sm text-accent">Try as many longevity improvements as you want</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-success text-xl">💾</span>
              <div>
                <h3 className="font-semibold text-white">1GB Legacy Vault</h3>
                <p className="text-sm text-accent">Store videos, photos, and important documents</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-success text-xl">📊</span>
              <div>
                <h3 className="font-semibold text-white">Advanced Tracking</h3>
                <p className="text-sm text-accent">Detailed insights into your longevity journey</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-success text-xl">🎨</span>
              <div>
                <h3 className="font-semibold text-white">Premium Themes</h3>
                <p className="text-sm text-accent">Customize your countdown experience</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">What's Next?</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => handleContinue("/extend")}
              className="p-4 bg-primary hover:bg-red-700 rounded-lg transition-colors"
            >
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold mb-1">Extend Your Life</h3>
              <p className="text-xs opacity-80">Try unlimited longevity simulations</p>
            </button>
            
            <button
              onClick={() => handleContinue("/vault")}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="text-2xl mb-2">🗃️</div>
              <h3 className="font-semibold mb-1">Build Your Vault</h3>
              <p className="text-xs opacity-80">Start creating your digital legacy</p>
            </button>
            
            <button
              onClick={() => handleContinue("/share")}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold mb-1">Share Your Journey</h3>
              <p className="text-xs opacity-80">Create beautiful countdown visuals</p>
            </button>
          </div>
        </div>

        {/* Support Info */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <p className="text-sm text-accent mb-2">
            <strong>Need help?</strong> We're here for you.
          </p>
          <p className="text-xs text-gray-400">
            Contact us at{" "}
            <a href="mailto:support@moreminutes.life" className="text-primary hover:underline">
              support@moreminutes.life
            </a>
          </p>
        </div>

        {/* Continue Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => handleContinue("/result")}
            className="px-8 py-3 bg-primary hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Continue to Dashboard
          </button>
          <button
            onClick={() => handleContinue("/settings")}
            className="px-8 py-3 bg-transparent border-2 border-gray-600 hover:border-white text-white font-semibold rounded-lg transition-colors"
          >
            Account Settings
          </button>
        </div>
      </div>
    </main>
  );
} 