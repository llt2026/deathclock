"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { savePrediction } from "../../lib/api";
import { trackEvent } from "../../lib/analytics";

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
    
    // 模拟调用寿命预测算法
    const dobDate = new Date(dob);
    const today = new Date();
    const ageYears = (today.getTime() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    // 简化预测：基础寿命期望
    const baseLifeExpectancy = sex === "male" ? 76 : 81;
    const remainingYears = Math.max(0, baseLifeExpectancy - ageYears);
    const predictedDeathDate = new Date();
    predictedDeathDate.setFullYear(predictedDeathDate.getFullYear() + remainingYears);
    
    const predictionData = {
      deathDate: predictedDeathDate,
      remainingYears: remainingYears.toFixed(1),
      baseRemainingYears: remainingYears,
      inputData: { dob, sex, ageYears },
    };
    
    setPrediction(predictionData);
    
    // 跟踪事件
    trackEvent('ViewResult', {
      birthYear: dobDate.getFullYear(),
      baseDaysLeft: Math.floor(remainingYears * 365.25),
      sex: sex,
    });
    
    setLoading(false);
  }, [router]);

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
          factors: prediction.inputData,
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
        <p className="text-accent">Calculating your remaining time...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 px-4">
      <div className="text-center">
        <h1 className="text-2xl mb-2">Your Predicted Life Countdown</h1>
        <p className="text-accent mb-4">
          Based on actuarial data and your inputs
        </p>
        {savingPrediction && (
          <p className="text-xs text-gray-500">Saving prediction...</p>
        )}
      </div>

      <div className="text-center">
        <div className="text-6xl font-display text-primary mb-4 font-mono">
          {timeLeft}
        </div>
        <p className="text-sm text-gray-400">
          Estimated end: {prediction?.deathDate.toLocaleDateString()}
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
      </div>
    </main>
  );
} 