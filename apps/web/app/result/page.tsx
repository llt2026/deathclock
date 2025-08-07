"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { calculateLifeExpectancy } from "@/packages/core/lifeCalc";
import { trackEvent, trackViewResult } from "../../lib/analytics";
import Link from "next/link";

interface Prediction {
  deathDate: string | Date;
  remainingYears: string;
  baseRemainingYears: number;
  adjustedYears?: number;
  currentAge: number;
  factors?: {
    baseMortalityRate?: number;
    gompertzAdjustment?: number;
  };
}

export default function ResultPage() {
  const { getAppUser } = useAuthStore();
  const user = getAppUser();
  const router = useRouter();

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Get user data from auth store or localStorage
    let dob: string | undefined;
    let sex: 'male' | 'female' | undefined;
    let userId = 'guest';
    
    if (user?.dob && user?.sex) {
      // Use authenticated user data
      dob = user.dob;
      sex = user.sex;
      userId = user.id;
    } else {
      // Try to get from localStorage for guest users
      const storedData = localStorage.getItem('userBirthData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        dob = parsedData.dob;
        sex = parsedData.sex;
      }
    }
    
    if (!dob || !sex) {
      router.push("/calc");
      return;
    }

    try {
      // Get risk factors from localStorage
      const storedRiskFactors = localStorage.getItem('riskFactors');
      const riskFactors = storedRiskFactors ? JSON.parse(storedRiskFactors) : {};

      // 使用真正的 SSA 2022 + Gompertz 算法
      const lifeCalcResult = calculateLifeExpectancy({
        dob,
        sex,
        userUid: userId,
        riskFactors,
      });

      const predictionData: Prediction = {
        deathDate: lifeCalcResult.predictedDeathDate,
        remainingYears: lifeCalcResult.baseRemainingYears.toFixed(1),
        baseRemainingYears: lifeCalcResult.baseRemainingYears,
        adjustedYears: lifeCalcResult.adjustedYears,
        currentAge: lifeCalcResult.currentAge,
        factors: lifeCalcResult.factors,
      };

      setPrediction(predictionData);

      // 埋点：查看结果
      const birthYear = new Date(dob).getFullYear();
      const baseDaysLeft = Math.floor(lifeCalcResult.baseRemainingYears * 365.25);
      trackViewResult(birthYear, baseDaysLeft);

      // 保存预测结果到本地存储（用于分享等功能）
      localStorage.setItem('lastPredictionResult', JSON.stringify(predictionData));
      
      trackEvent("prediction_calculated", {
        deathDate: lifeCalcResult.predictedDeathDate.toISOString(),
        remainingYears: lifeCalcResult.baseRemainingYears.toFixed(1),
        currentAge: lifeCalcResult.currentAge,
        algorithm: 'ssa2022_gompertz'
      });

    } catch (error) {
      console.error("Life calculation failed:", error);
      alert("Calculation failed. Please try again.");
      router.push("/calc");
    }
  }, [user, router]);

  // 实时倒计时更新
  useEffect(() => {
    if (!prediction) return;
    
    const updateCountdown = () => {
      setCurrentTime(new Date());
    };
    
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prediction]);

  const getTimeLeft = () => {
    if (!prediction || !prediction.deathDate) return "Calculating...";
    
    const now = currentTime.getTime();
    const target = new Date(prediction.deathDate).getTime();
    const diff = target - now;
    
    if (diff <= 0) return "Time's up!";
    
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${years}y ${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  if (!prediction) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Calculating your life countdown...</p>
          <p className="text-xs text-gray-500 mt-2">Using SSA 2022 Life Table + Gompertz Model</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-display text-primary mb-8">
          Your Life Countdown
        </h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <p className="text-accent mb-2">Time remaining</p>
          <div className="text-4xl font-display text-primary mb-4 font-mono countdown-pulse">
            {getTimeLeft()}
          </div>
          <p className="text-sm text-gray-400 mb-2">
            Estimated end: {new Date(prediction.deathDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            Remaining: ~{prediction.remainingYears} years | Current age: {prediction.currentAge}
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/extend" className="w-full inline-block">
            <span className="block w-full py-3 bg-success text-black font-semibold rounded-lg hover:bg-green-400 transition-colors text-center">
              + Try +30 Days
            </span>
          </Link>

          <Link href="/share" className="w-full inline-block">
            <span className="block w-full py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors text-center">
              Share Result
            </span>
          </Link>

          <Link href="/vault" className="w-full inline-block">
            <span className="block w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-center">
              Legacy Vault
            </span>
          </Link>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>⚠️ For entertainment only, not medical advice.</p>
          <p>&quot;Count less, live more.&quot; - Remember, this is just a reminder to cherish every moment.</p>
          {prediction.factors && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer">Algorithm Details</summary>
              <div className="text-xs text-gray-600 mt-2 bg-gray-800 p-2 rounded">
                <p>
                  Base mortality rate: {((prediction.factors?.baseMortalityRate ?? 0) * 100).toFixed(4)}%
                </p>
                <p>
                  Gompertz adjustment: {((prediction.factors?.gompertzAdjustment ?? 0) * 100).toFixed(4)}%
                </p>
                <p>Data source: SSA 2022 Period Life Table</p>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
} 