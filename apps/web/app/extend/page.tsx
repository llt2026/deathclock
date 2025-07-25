"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { simulateLongevityNudge, calculateLifeExpectancy } from "../../../packages/core/lifeCalc";
import { trackEvent } from "../../lib/analytics";

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

interface ExtendedPrediction {
  originalDays: number;
  newDays: number;
  daysAdded: number;
  improvements: string[];
}

export default function ExtendLifeScreen() {
  const [selectedTips, setSelectedTips] = useState<number[]>([]);
  const [originalPrediction, setOriginalPrediction] = useState<any>(null);
  const [extendedPrediction, setExtendedPrediction] = useState<ExtendedPrediction | null>(null);
  const [animatingTip, setAnimatingTip] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 从 localStorage 读取原始预测数据
    const inputData = localStorage.getItem("deathClockInput");
    const resultData = localStorage.getItem("lastPredictionResult");
    
    if (inputData) {
      const { dob, sex } = JSON.parse(inputData);
      try {
        const prediction = calculateLifeExpectancy({
          dob,
          sex,
          userUid: 'extend_simulation',
        });
        setOriginalPrediction(prediction);
      } catch (error) {
        console.error("Failed to load prediction:", error);
      }
    }
  }, []);

  const calculateCombinedImprovement = (tipIndices: number[]): number => {
    // 组合多个改进因子，使用乘法但限制总改进
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
    setAnimatingTip(index);

    if (newSelectedTips.length > 0) {
      // 计算组合改进效果
      const improvementFactor = calculateCombinedImprovement(newSelectedTips);
      const extendedResult = simulateLongevityNudge(originalPrediction, improvementFactor);
      
      const originalDays = Math.floor(originalPrediction.baseRemainingYears * 365.25);
      const newDays = Math.floor((extendedResult.adjustedYears || originalPrediction.baseRemainingYears) * 365.25);
      const daysAdded = newDays - originalDays;
      
      setExtendedPrediction({
        originalDays,
        newDays,
        daysAdded,
        improvements: newSelectedTips.map(i => LONGEVITY_TIPS[i].action),
      });

      // 跟踪事件
      trackEvent('NudgeComplete', {
        deltaDays: daysAdded,
        improvementCount: newSelectedTips.length,
        categories: newSelectedTips.map(i => LONGEVITY_TIPS[i].category),
      });

    } else {
      setExtendedPrediction(null);
    }
    
    // 动画效果
    setTimeout(() => {
      setAnimatingTip(null);
    }, 1500);
  };

  const resetAll = () => {
    setSelectedTips([]);
    setExtendedPrediction(null);
    setAnimatingTip(null);
  };

  return (
    <main className="flex flex-col items-center min-h-screen gap-8 py-8 px-4">
      <div className="text-center">
        <button
          onClick={() => router.back()}
          className="text-accent hover:text-white transition mb-4"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-display mb-2">Extend Your Life</h1>
        <p className="text-accent mb-4">
          Small changes, big impact. See how healthy habits can add days to your countdown.
        </p>
        
        {extendedPrediction && (
          <div className="bg-success/20 border border-success rounded-lg p-6 mb-6 max-w-md mx-auto">
            <div className="text-3xl font-display text-success mb-2">
              +{extendedPrediction.daysAdded.toLocaleString()} days! 🎉
            </div>
            <div className="text-sm text-gray-300">
              From {extendedPrediction.originalDays.toLocaleString()} to{' '}
              {extendedPrediction.newDays.toLocaleString()} days
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {extendedPrediction.improvements.length} improvement{extendedPrediction.improvements.length > 1 ? 's' : ''} active
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 w-full max-w-2xl">
        {LONGEVITY_TIPS.map((tip, index) => {
          const isSelected = selectedTips.includes(index);
          const isAnimating = animatingTip === index;
          const potentialDays = originalPrediction 
            ? Math.floor(originalPrediction.baseRemainingYears * 365.25 * (tip.improvement - 1))
            : Math.floor(25 * 365.25 * (tip.improvement - 1)); // fallback
          
          return (
            <div
              key={index}
              className={`p-4 border rounded-lg transition-all duration-300 ${
                isAnimating
                  ? "border-success bg-success/20 scale-105 shadow-lg"
                  : isSelected
                  ? "border-success bg-success/10"
                  : "border-gray-600 hover:border-gray-500"
              }`}
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
        <div className="text-center">
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition text-sm"
          >
            Reset All Changes
          </button>
        </div>
      )}

      <div className="text-center space-y-4">
        <div className="p-6 border border-yellow-600 rounded-lg bg-yellow-900/20 max-w-md mx-auto">
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

        <div className="text-xs text-gray-500 max-w-md mx-auto">
          <p className="mb-2">📊 Algorithm Transparency:</p>
          <p>Improvements calculated using scientific longevity research. Individual results may vary.</p>
          <p>For entertainment only, not medical advice.</p>
        </div>
      </div>
    </main>
  );
} 