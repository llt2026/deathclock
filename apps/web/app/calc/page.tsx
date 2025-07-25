"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { trackEvent } from "../../lib/analytics";

export default function CalcPage() {
  const { getAppUser, updateUserMetadata } = useAuthStore();
  const user = getAppUser();
  const router = useRouter();

  const [dob, setDob] = useState(user?.dob || "");
  const [sex, setSex] = useState<"male" | "female" | "">(user?.sex || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dob || !sex) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // 更新用户元数据
      await updateUserMetadata({ dob, sex });

      // 埋点
      trackEvent("calculation_started", {
        birth_year: new Date(dob).getFullYear(),
        sex,
        user_type: user ? "authenticated" : "guest"
      });

      // 跳转到结果页面
      router.push("/result");
    } catch (error) {
      console.error("Failed to update user info:", error);
      alert("Failed to save information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-primary mb-4">
            Calculate Your Time
          </h1>
          <p className="text-accent">
            Just two quick questions to predict your life countdown
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-white"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Gender
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="male"
                  checked={sex === "male"}
                  onChange={(e) => setSex(e.target.value as "male")}
                  className="mr-2 text-primary focus:ring-primary"
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="female"
                  checked={sex === "female"}
                  onChange={(e) => setSex(e.target.value as "female")}
                  className="mr-2 text-primary focus:ring-primary"
                />
                Female
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? "Calculating..." : "Calculate My Life Countdown"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-accent">
            For entertainment only, not medical advice.
            <br />
            Based on SSA 2022 actuarial data.
          </p>
        </div>
      </div>
    </div>
  );
} 