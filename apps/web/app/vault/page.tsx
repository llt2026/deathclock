"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { PinManager } from "../../lib/crypto";

interface VaultItem {
  id: string;
  type: "audio" | "video" | "text";
  name: string;
  trigger: "fixed_date" | "inactivity";
  triggerValue: string;
  createdAt: string;
  size: number;
}

export default function VaultDashboard() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const router = useRouter();
  const { user, session } = useAuthStore();

  useEffect(() => {
    // 检查是否需要设置 PIN
    if (user && !PinManager.hasPin()) {
      setShowPinSetup(true);
    }
    
    // 模拟加载 vault 数据
    setTimeout(() => {
      setVaultItems([
        {
          id: "1",
          type: "audio",
          name: "Final Message to Family",
          trigger: "fixed_date",
          triggerValue: "2025-12-31",
          createdAt: "2025-01-15",
          size: 2.1, // MB
        },
        {
          id: "2", 
          type: "text",
          name: "Passwords & Important Info",
          trigger: "inactivity",
          triggerValue: "6 months",
          createdAt: "2025-01-10",
          size: 0.05,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [user]);

  const handleCreateNew = () => {
    if (!user) {
      router.push("/auth/request");
      return;
    }
    
    if (!PinManager.hasPin()) {
      setShowPinSetup(true);
      return;
    }
    
    router.push("/vault/record");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "audio": return "🎙️";
      case "video": return "🎥";
      case "text": return "📝";
      default: return "📄";
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const totalSize = vaultItems.reduce((sum, item) => sum + item.size, 0);
  const storageLimit = user ? 1024 : 50; // Pro: 1GB, Free: 50MB

  if (showPinSetup) {
    return <PinSetupModal onComplete={() => setShowPinSetup(false)} />;
  }

  return (
    <main className="flex flex-col min-h-screen gap-6 py-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-display mb-2">Legacy Vault</h1>
        <p className="text-accent">
          Secure digital messages delivered when you're no longer here.
        </p>
      </div>

      {/* 存储使用情况 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Storage Used</span>
          <span className="text-sm">
            {formatFileSize(totalSize)} / {formatFileSize(storageLimit)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${Math.min((totalSize / storageLimit) * 100, 100)}%` }}
          ></div>
        </div>
        {!user && (
          <p className="text-xs text-gray-400 mt-2">
            Sign in to unlock 1GB Pro storage
          </p>
        )}
      </div>

      {/* Vault 列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-accent">Loading your vault...</p>
          </div>
        ) : vaultItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-medium mb-2">Your Vault is Empty</h3>
            <p className="text-accent mb-6">
              Create your first digital legacy message.
            </p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-primary text-white rounded-md hover:opacity-90 transition"
            >
              Create First Message
            </button>
          </div>
        ) : (
          <>
            {vaultItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-400">
                        {item.trigger === "fixed_date" 
                          ? `Deliver on ${item.triggerValue}`
                          : `Deliver after ${item.triggerValue} of inactivity`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{formatFileSize(item.size)}</p>
                    <p className="text-xs text-gray-500">{item.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={handleCreateNew}
              className="w-full py-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition text-gray-400 hover:text-white"
            >
              + Add New Message
            </button>
          </>
        )}
      </div>
    </main>
  );
}

// PIN 设置模态框组件
function PinSetupModal({ onComplete }: { onComplete: () => void }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleSetPin = () => {
    if (pin !== confirmPin) {
      setError("PINs don't match");
      return;
    }
    
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN must be 4-6 digits");
      return;
    }
    
    PinManager.savePin(pin);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-display mb-4">Set Your Vault PIN</h2>
        <p className="text-sm text-gray-300 mb-6">
          Create a 4-6 digit PIN to encrypt your legacy messages. This PIN is stored only on your device.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">PIN (4-6 digits)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-center tracking-widest"
              placeholder="Enter PIN"
              maxLength={6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Confirm PIN</label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-center tracking-widest"
              placeholder="Confirm PIN"
              maxLength={6}
            />
          </div>
          
          {error && (
            <p className="text-primary text-sm">{error}</p>
          )}
          
          <button
            onClick={handleSetPin}
            disabled={!pin || !confirmPin}
            className="w-full px-4 py-3 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 transition"
          >
            Set PIN & Secure Vault
          </button>
        </div>
      </div>
    </div>
  );
} 