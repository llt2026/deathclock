"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { trackEvent } from "../../lib/analytics";

interface RiskFactors {
  smoking: boolean;
  drinking: boolean;
  sedentary: boolean;
  stress: boolean;
}

export default function CalcPage() {
  const { getAppUser, updateUserMetadata } = useAuthStore();
  const user = getAppUser();
  const router = useRouter();

  const [birthMonth, setBirthMonth] = useState<string>("");
  const [birthDay, setBirthDay] = useState<string>("");
  const [birthYear, setBirthYear] = useState<string>("");
  const [sex, setSex] = useState<"male" | "female" | "">(user?.sex || "");
  const [riskFactors, setRiskFactors] = useState<RiskFactors>({
    smoking: false,
    drinking: false,
    sedentary: false,
    stress: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize from existing user data
  useEffect(() => {
    if (user?.dob) {
      const date = new Date(user.dob);
      setBirthMonth(String(date.getMonth() + 1).padStart(2, '0'));
      setBirthDay(String(date.getDate()).padStart(2, '0'));
      setBirthYear(String(date.getFullYear()));
    }
  }, [user?.dob]);

  const handleRiskChange = (factor: keyof RiskFactors) => {
    setRiskFactors(prev => ({
      ...prev,
      [factor]: !prev[factor]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthMonth || !birthDay || !birthYear || !sex) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate date
    const date = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
    if (date > new Date()) {
      alert("Please enter a valid birth date");
      return;
    }

    const dob = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    
    setIsSubmitting(true);

    try {
      // Save data locally first
      localStorage.setItem('userBirthData', JSON.stringify({ dob, sex }));
      
      // Update user metadata if logged in
      if (user) {
        try {
          await updateUserMetadata({ dob, sex });
        } catch (error) {
          console.warn('Failed to sync to cloud, but data saved locally:', error);
          // Continue anyway - we have local data
        }
      }

      // Save risk factors to localStorage for use in result page
      localStorage.setItem('riskFactors', JSON.stringify(riskFactors));

      // Track analytics
      trackEvent("calculation_started", {
        birth_year: parseInt(birthYear),
        sex,
        user_type: user ? "authenticated" : "guest",
        risk_factors: riskFactors
      });

      // Navigate to results
      router.push("/result");
    } catch (error) {
      console.error("Failed to update user info:", error);
      alert("Failed to save information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

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
          {/* Date of Birth - American Style */}
          <div>
            <label className="block text-sm font-medium mb-2">
              When were you born? *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-white text-sm"
                required
              >
                <option value="">Month</option>
                {months.map((month, index) => (
                  <option key={month} value={String(index + 1).padStart(2, '0')}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-white text-sm"
                required
              >
                <option value="">Day</option>
                {days.map(day => (
                  <option key={day} value={String(day).padStart(2, '0')}>
                    {day}
                  </option>
                ))}
              </select>
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-white text-sm"
                required
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Gender *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="male"
                  checked={sex === "male"}
                  onChange={(e) => setSex(e.target.value as "male")}
                  className="mr-2 text-primary focus:ring-primary"
                />
                Male
              </label>
              <label className="flex items-center cursor-pointer">
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

          {/* Risk Factors */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Lifestyle Factors (optional)
            </label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={riskFactors.smoking}
                  onChange={() => handleRiskChange('smoking')}
                  className="mr-3 text-primary focus:ring-primary"
                />
                <span className="text-sm">I smoke regularly</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={riskFactors.drinking}
                  onChange={() => handleRiskChange('drinking')}
                  className="mr-3 text-primary focus:ring-primary"
                />
                <span className="text-sm">I drink alcohol frequently</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={riskFactors.sedentary}
                  onChange={() => handleRiskChange('sedentary')}
                  className="mr-3 text-primary focus:ring-primary"
                />
                <span className="text-sm">I rarely exercise</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={riskFactors.stress}
                  onChange={() => handleRiskChange('stress')}
                  className="mr-3 text-primary focus:ring-primary"
                />
                <span className="text-sm">I&apos;m often stressed</span>
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