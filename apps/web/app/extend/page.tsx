"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { simulateLongevityNudge, calculateLifeExpectancy } from "@/packages/core/lifeCalc";
import { trackEvent, trackNudgeComplete } from "../../lib/analytics";
import { useAuthStore } from "../../store/auth";
import type { LifePrediction } from "@/packages/core/lifeCalc";

const LONGEVITY_TIPS = [
  { action: "Walk 10,000 steps daily", improvement: 1.02, description: "Improve cardiovascular health", category: "exercise" },
  { action: "Eat Mediterranean diet", improvement: 1.035, description: "Rich in antioxidants and healthy fats", category: "nutrition" },
  { action: "Get 7-8 hours of sleep", improvement: 1.025, description: "Better recovery and mental health", category: "sleep" },
  { action: "Practice meditation", improvement: 1.015, description: "Reduce stress and inflammation", category: "mental" },
  { action: "Stay socially connected", improvement: 1.03, description: "Strong relationships boost longevity", category: "social" },
  { action: "Limit alcohol consumption", improvement: 1.028, description: "Reduce liver damage and cancer risk", category: "lifestyle" },
  { action: "Regular health checkups", improvement: 1.022, description: "Early detection saves lives", category: "medical" },
  { action: "Learn new skills", improvement: 1.018, description: "Keep your brain active and growing", category: "mental" },
];

export default function ExtendPage() {
  const { getAppUser } = useAuthStore();
  const user = getAppUser();
  const router = useRouter();
  
  const [selectedTips, setSelectedTips] = useState<number[]>([]);
  const [originalPrediction, setOriginalPrediction] = useState<LifePrediction | null>(null);
  const [adjustedPrediction, setAdjustedPrediction] = useState<(LifePrediction & { daysAdded: number; improvements: string[] }) | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // 获取原始预测或重新计算
    const stored = localStorage.getItem('lastPredictionResult');
    if (stored) {
      const prediction = JSON.parse(stored) as LifePrediction;
      setOriginalPrediction(prediction);
    } else if (user?.dob && user?.sex) {
      // 重新计算预测
      try {
        const prediction = calculateLifeExpectancy({
          dob: user.dob,
          sex: user.sex,
          userUid: user.id,
        });
        setOriginalPrediction(prediction);
      } catch (error) {
        console.error("Failed to calculate prediction:", error);
        router.push("/calc");
      }
    } else {
      router.push("/calc");
    }
  }, [user, router]);

  const calculateCombinedImprovement = (tipIndices: number[]): number => {
    let combinedImprovement = 1;
    tipIndices.forEach(index => {
      combinedImprovement *= LONGEVITY_TIPS[index].improvement;
    });
    // 限制最大改进为 15%
    return Math.min(combinedImprovement, 1.15);
  };

  const handleTryTip = (index: number) => {
    if (!originalPrediction) return;

    const newSelectedTips = selectedTips.includes(index) 
      ? selectedTips.filter(i => i !== index)
      : [...selectedTips, index];
    
    setSelectedTips(newSelectedTips);
    setIsAnimating(true);

    if (newSelectedTips.length > 0) {
      const improvementFactor = calculateCombinedImprovement(newSelectedTips);
      const extendedResult = simulateLongevityNudge(originalPrediction, improvementFactor);
      
      const originalDays = Math.floor(originalPrediction.baseRemainingYears * 365.25);
      const newDays = Math.floor((extendedResult.adjustedYears || originalPrediction.baseRemainingYears) * 365.25);
      const daysAdded = newDays - originalDays;
      
      setAdjustedPrediction({
        ...extendedResult,
        daysAdded,
        improvements: newSelectedTips.map(i => LONGEVITY_TIPS[i].action),
      });

      // 埋点：延寿完成
      trackNudgeComplete(daysAdded);
      
      trackEvent('nudge_applied', {
        tip: LONGEVITY_TIPS[index].action,
        improvement_factor: LONGEVITY_TIPS[index].improvement,
        days_added: daysAdded,
        total_tips: newSelectedTips.length
      });
    } else {
      setAdjustedPrediction(null);
    }
    
    setTimeout(() => setIsAnimating(false), 1500);
  };

  const resetAll = () => {
    setSelectedTips([]);
    setAdjustedPrediction(null);
    setIsAnimating(false);
  };

  if (!originalPrediction) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your life prediction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="text-accent hover:text-white transition mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-display text-primary mb-4">
            Extend Your Life
          </h1>
          <p className="text-accent">
            Small changes, big impact. See how healthy habits can add days to your countdown.
          </p>
        </div>

        {adjustedPrediction && (
          <div className="bg-success/20 border border-success rounded-lg p-6 mb-8 text-center">
            <div className="text-3xl font-display text-success mb-2">
              +{adjustedPrediction.daysAdded.toLocaleString()} days! 🎉
            </div>
            <div className="text-sm text-gray-300">
              Extended from {Math.floor(originalPrediction.baseRemainingYears * 365.25).toLocaleString()} to{' '}
              {Math.floor((adjustedPrediction.adjustedYears || originalPrediction.baseRemainingYears) * 365.25).toLocaleString()} days
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {adjustedPrediction.improvements.length} improvement{adjustedPrediction.improvements.length > 1 ? 's' : ''} active
            </div>
          </div>
        )}

        <div className="grid gap-4 mb-8">
          {LONGEVITY_TIPS.map((tip, index) => {
            const isSelected = selectedTips.includes(index);
            const potentialDays = Math.floor(originalPrediction.baseRemainingYears * 365.25 * (tip.improvement - 1));
            
            return (
              <div
                key={index}
                className={`p-4 border rounded-lg transition-all duration-300 ${
                  isSelected
                    ? "border-success bg-success/10"
                    : "border-gray-600 hover:border-gray-500"
                } ${isAnimating ? "scale-105" : ""}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{tip.action}</h3>
                  <span className={`font-display ${isSelected ? 'text-success' : 'text-gray-400'}`}>
                    +{potentialDays} days
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{tip.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300 capitalize">
                    {tip.category}
                  </span>
                  <button
                    onClick={() => handleTryTip(index)}
                    className={`px-4 py-2 rounded-md text-sm transition ${
                      isSelected
                        ? "bg-success text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    {isSelected ? "✓ Active" : "Try This"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {selectedTips.length > 0 && (
          <div className="text-center mb-6">
            <button
              onClick={resetAll}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition text-sm"
            >
              Reset All Changes
            </button>
          </div>
        )}

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
              Upgrade to Plus - $3.99/mo
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

          <div className="text-xs text-gray-500">
            <p className="mb-2">📊 Algorithm Transparency:</p>
            <p>Improvements calculated using scientific longevity research. Individual results may vary.</p>
            <p>For entertainment only, not medical advice.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 