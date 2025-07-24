export const metadata = {
  title: "Settings | More Minutes",
  description: "Manage your account preferences and privacy settings",
};

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const exportData = async () => {
    setIsExporting(true);
    try {
      // 模拟数据导出
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const exportData = {
        user: user,
        predictions: [], // 从API获取
        vaultItems: [], // 从API获取
        exportDate: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moreminutes-data-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert("Your data has been exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const deleteAccount = async () => {
    try {
      // TODO: 实际的账号删除API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Account deletion initiated. You will receive a confirmation email.");
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Account deletion failed:", error);
      alert("Failed to delete account. Please contact support.");
    }
  };

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-accent hover:text-white mb-4 transition"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-display mb-2">Settings</h1>
        <p className="text-accent">Manage your preferences and account</p>
      </div>

      {/* User Info */}
      <section className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-accent">Email:</span>
            <span>{user?.email || "guest@example.com"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-accent">Status:</span>
            <span className="text-success">Free Plan</span>
          </div>
          <div className="flex justify-between">
            <span className="text-accent">Member since:</span>
            <span>January 2025</span>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        
        <div className="space-y-6">
          {/* Theme */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Theme</h3>
              <p className="text-sm text-accent">Choose your display preference</p>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as "dark" | "light")}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          {/* Sound */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Countdown Sounds</h3>
              <p className="text-sm text-accent">Heart beat sound effects</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 rounded-full transition ${
                soundEnabled ? "bg-success" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  soundEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Algorithm Disclosure */}
      <section className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Algorithm Disclosure</h2>
        <div className="text-sm text-accent space-y-2">
          <p>
            <strong>Data Source:</strong> U.S. Social Security Administration 2022 Period Life Table
          </p>
          <p>
            <strong>Method:</strong> Gompertz mortality model with randomization parameters (b=0.000045, c=1.098)
          </p>
          <p>
            <strong>Privacy:</strong> All calculations run locally in your browser. No health data is transmitted.
          </p>
          <p>
            <strong>Disclaimer:</strong> For entertainment purposes only. Not medical advice.
          </p>
        </div>
      </section>

      {/* Data & Privacy */}
      <section className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
        
        <div className="space-y-4">
          <button
            onClick={exportData}
            disabled={isExporting}
            className="w-full p-3 bg-gray-800 text-left rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Export Your Data</h3>
                <p className="text-sm text-accent">Download all your data as JSON</p>
              </div>
              <span className="text-2xl">📥</span>
            </div>
          </button>

          <button
            onClick={() => router.push("/legal")}
            className="w-full p-3 bg-gray-800 text-left rounded-lg hover:bg-gray-700 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Privacy Policy</h3>
                <p className="text-sm text-accent">View our privacy policy</p>
              </div>
              <span className="text-2xl">📋</span>
            </div>
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-900/20 border border-red-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-red-300">
              <p>⚠️ This action cannot be undone. This will permanently:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Delete your account and profile</li>
                <li>Remove all your Legacy Vault items</li>
                <li>Cancel any active subscriptions</li>
                <li>Erase all prediction history</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={deleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
} 