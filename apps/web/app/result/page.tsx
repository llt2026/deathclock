"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { savePrediction } from "../../lib/api";
import { trackEvent } from "../../lib/analytics";
import { calculateLifeExpectancy } from "../../../packages/core/lifeCalc";

export default function ResultPage() {
  const [prediction, setPrediction] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingPrediction, setSavingPrediction] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // 从 localStorage 读取输入数据
    const inputData = localStorage.getItem("deathClockInput");
    if (!inputData) {
      router.push("/calc");
      return;
    }

    const { dob, sex } = JSON.parse(inputData);
    
    try {
      // 使用真实的 Gompertz 算法计算
      const lifeCalcResult = calculateLifeExpectancy({
        dob,
        sex,
        userUid: user?.id || 'anonymous_user',
      });
      
      const predictionData = {
        deathDate: lifeCalcResult.predictedDeathDate,
        remainingYears: lifeCalcResult.baseRemainingYears.toFixed(1),
        baseRemainingYears: lifeCalcResult.baseRemainingYears,
        inputData: { dob, sex },
        algorithmFactors: lifeCalcResult.factors,
        currentAge: lifeCalcResult.currentAge,
      };
      
      setPrediction(predictionData);
      
      // 保存结果数据到 localStorage 供分享功能使用
      localStorage.setItem('lastPredictionResult', JSON.stringify({
        timeLeft: '',
        deathDate: lifeCalcResult.predictedDeathDate.toISOString(),
        remainingYears: lifeCalcResult.baseRemainingYears.toFixed(1),
        currentAge: lifeCalcResult.currentAge,
      }));
      
      // 跟踪事件
      trackEvent('ViewResult', {
        birthYear: new Date(dob).getFullYear(),
        baseDaysLeft: Math.floor(lifeCalcResult.baseRemainingYears * 365.25),
        sex: sex,
        currentAge: lifeCalcResult.currentAge,
      });
      
    } catch (error) {
      console.error("Life calculation error:", error);
      // 回退到简化计算
      const dobDate = new Date(dob);
      const today = new Date();
      const ageYears = (today.getTime() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      
      const baseLifeExpectancy = sex === "male" ? 76 : 81;
      const remainingYears = Math.max(0, baseLifeExpectancy - ageYears);
      const predictedDeathDate = new Date();
      predictedDeathDate.setFullYear(predictedDeathDate.getFullYear() + remainingYears);
      
      setPrediction({
        deathDate: predictedDeathDate,
        remainingYears: remainingYears.toFixed(1),
        baseRemainingYears: remainingYears,
        inputData: { dob, sex },
        fallbackCalculation: true,
      });
    }
    
    setLoading(false);
  }, [router, user]);

  // 保存预测结果到数据库
  useEffect(() => {
    if (!prediction || !user || savingPrediction) return;

    const savePredictionToDb = async () => {
      setSavingPrediction(true);
      try {
        const predictionData = {
          user_id: user.id,
          predicted_dod: prediction.deathDate.toISOString().split('T')[0],
          base_remaining_years: prediction.baseRemainingYears,
          factors: prediction.algorithmFactors || prediction.inputData,
        };

        const result = await savePrediction(predictionData);
        if (!result.success) {
          console.error('Failed to save prediction:', result.error);
        }
      } catch (error) {
        console.error('Error saving prediction:', error);
      } finally {
        setSavingPrediction(false);
      }
    };

    savePredictionToDb();
  }, [prediction, user, savingPrediction]);

  useEffect(() => {
    if (!prediction) return;
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = prediction.deathDate.getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft("Time's up!");
        return;
      }
      
      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${years}y ${days}d ${hours}h ${minutes}m ${seconds}s`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prediction]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-accent">Calculating your remaining time...</p>
          <p className="text-sm text-gray-500 mt-2">Using SSA 2022 Life Table + Gompertz Model</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 px-4">
      <div className="text-center">
        <h1 className="text-2xl mb-2">Your Predicted Life Countdown</h1>
        <p className="text-accent mb-4">
          Based on SSA 2022 actuarial data and Gompertz mortality model
        </p>
        {prediction?.fallbackCalculation && (
          <p className="text-yellow-400 text-sm mb-2">⚠️ Using simplified calculation</p>
        )}
        {savingPrediction && (
          <p className="text-xs text-gray-500">Saving prediction...</p>
        )}
        {prediction?.currentAge && (
          <p className="text-sm text-gray-400">Current age: {prediction.currentAge} years</p>
        )}
      </div>

      <div className="text-center">
        <div className="text-6xl font-display text-primary mb-4 font-mono">
          {timeLeft}
        </div>
        <p className="text-sm text-gray-400">
          Estimated end: {prediction?.deathDate.toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Remaining: ~{prediction?.remainingYears} years
        </p>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => router.push("/extend")}
          className="px-6 py-3 bg-success text-white rounded-md hover:opacity-90 transition"
        >
          Try +30 Days
        </button>
        
        <button
          onClick={() => router.push("/share")}
          className="px-6 py-3 bg-gray-700 text-white rounded-md hover:opacity-90 transition"
        >
          Share Result
        </button>
        
        <button
          onClick={() => router.push("/vault")}
          className="px-6 py-3 bg-accent text-white rounded-md hover:opacity-90 transition"
        >
          Legacy Vault
        </button>
      </div>

      <div className="text-center max-w-md">
        <p className="text-xs text-gray-500 mb-4">
          ⚠️ For entertainment only, not medical advice.
        </p>
        <p className="text-sm text-gray-400">
          "Count less, live more." - Remember, this is just a reminder to cherish every moment.
        </p>
        {prediction?.algorithmFactors && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer">Algorithm Details</summary>
            <div className="text-xs text-gray-600 mt-2 bg-gray-800 p-2 rounded">
              <p>Base mortality rate: {(prediction.algorithmFactors.baseMortalityRate * 100).toFixed(4)}%</p>
              <p>Gompertz adjustment: {(prediction.algorithmFactors.gompertzAdjustment * 100).toFixed(4)}%</p>
              <p>Data source: SSA 2022 Period Life Table</p>
            </div>
          </details>
        )}
      </div>
    </main>
  );
} 