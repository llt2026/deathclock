"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LONGEVITY_TIPS = [
  { action: "Walk 10,000 steps daily", days: 30, description: "Improve cardiovascular health" },
  { action: "Eat Mediterranean diet", days: 45, description: "Rich in antioxidants and healthy fats" },
  { action: "Get 7-8 hours of sleep", days: 25, description: "Better recovery and mental health" },
  { action: "Practice meditation", days: 20, description: "Reduce stress and inflammation" },
  { action: "Stay socially connected", days: 35, description: "Strong relationships boost longevity" },
  { action: "Limit alcohol consumption", days: 40, description: "Reduce liver damage and cancer risk" },
];

export default function ExtendLifeScreen() {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [totalDaysAdded, setTotalDaysAdded] = useState(0);
  const router = useRouter();

  const handleTryTip = (index: number) => {
    const tip = LONGEVITY_TIPS[index];
    setSelectedTip(index);
    setTotalDaysAdded(prev => prev + tip.days);
    
    // 简单动效提示
    setTimeout(() => {
      setSelectedTip(null);
    }, 2000);
  };

  return (
    <main className="flex flex-col items-center min-h-screen gap-8 py-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-display mb-2">Extend Your Life</h1>
        <p className="text-accent mb-4">
          Small changes, big impact. See how healthy habits can add days to your countdown.
        </p>
        {totalDaysAdded > 0 && (
          <div className="text-2xl text-success font-display">
            +{totalDaysAdded} days added! 🎉
          </div>
        )}
      </div>

      <div className="grid gap-4 w-full max-w-2xl">
        {LONGEVITY_TIPS.map((tip, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg transition-all ${
              selectedTip === index
                ? "border-success bg-success/10 scale-105"
                : "border-gray-600 hover:border-gray-500"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{tip.action}</h3>
              <span className="text-success font-display">+{tip.days} days</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{tip.description}</p>
            <button
              onClick={() => handleTryTip(index)}
              disabled={selectedTip === index}
              className={`px-4 py-2 rounded-md text-sm transition ${
                selectedTip === index
                  ? "bg-success text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              {selectedTip === index ? "✓ Added!" : "Try This"}
            </button>
          </div>
        ))}
      </div>

      <div className="text-center space-y-4">
        <div className="p-6 border border-yellow-600 rounded-lg bg-yellow-900/20">
          <h3 className="text-lg font-medium mb-2">Want More Personalized Tips?</h3>
          <p className="text-sm text-gray-300 mb-4">
            Unlock unlimited longevity simulations, detailed health tracking, and AI-powered recommendations.
          </p>
          <button
            onClick={() => router.push("/subscribe")}
            className="px-6 py-3 bg-primary text-white rounded-md hover:opacity-90 transition font-medium"
          >
            Upgrade to Pro - $3.99/mo
          </button>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/result")}
            className="px-4 py-2 text-accent hover:text-white transition"
          >
            ← Back to Countdown
          </button>
          
          <button
            onClick={() => router.push("/vault")}
            className="px-4 py-2 text-accent hover:text-white transition"
          >
            Set Up Legacy Vault →
          </button>
        </div>
      </div>
    </main>
  );
} 