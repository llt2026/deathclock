"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import USDatePicker from "../../components/USDatePicker";

export default function CalcWizard() {
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [risks, setRisks] = useState({
    smoking: false,
    drinking: false,
  });
  const router = useRouter();

  const handleSubmit = () => {
    if (!dob) {
      alert("Please select your birth date");
      return;
    }
    // 保存到 localStorage 用于 result 页面
    localStorage.setItem("deathClockInput", JSON.stringify({ dob, sex, risks }));
    router.push("/result");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-display mb-2">Life Calculation</h1>
        <p className="text-accent">Just 3 simple questions. Takes 10 seconds.</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Birth Date */}
        <div>
          <label className="block text-sm font-medium mb-2">Birth Date</label>
          <USDatePicker
            value={dob}
            onChange={setDob}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Sex */}
        <div>
          <label className="block text-sm font-medium mb-2">Sex</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="male"
                checked={sex === "male"}
                onChange={(e) => setSex(e.target.value as "male")}
                className="text-primary"
              />
              Male
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="female"
                checked={sex === "female"}
                onChange={(e) => setSex(e.target.value as "female")}
                className="text-primary"
              />
              Female
            </label>
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <label className="block text-sm font-medium mb-2">Risk Factors (Optional)</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={risks.smoking}
                onChange={(e) => setRisks(prev => ({ ...prev, smoking: e.target.checked }))}
                className="text-primary"
              />
              Regular smoking
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={risks.drinking}
                onChange={(e) => setRisks(prev => ({ ...prev, drinking: e.target.checked }))}
                className="text-primary"
              />
              Heavy drinking
            </label>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full px-6 py-3 bg-primary text-white rounded-md hover:opacity-90 transition font-medium"
        >
          Calculate My Time
        </button>
      </div>

      <p className="text-xs text-gray-500 max-w-md text-center">
        For entertainment only, not medical advice.
      </p>
    </main>
  );
} 