"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { getVaultList, getVaultDownloadUrl } from "../../lib/api";
import { PinManager } from "../../lib/crypto";
import { VaultCrypto } from "../../lib/crypto";
import { toast } from "../../lib/toast";
import { getSubscriptionStatus } from "../../lib/api";

interface VaultItem {
  id: string;
  type: "audio" | "video" | "text";
  storagePath: string;
  trigger: "fixed_date" | "inactivity";
  triggerValue: string;
  createdAt: string;
  delivered: boolean;
  encrypted?: boolean;
}

export default function VaultDashboard() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuthStore();
  const [subActive, setSubActive] = useState<boolean | null>(null);

  const loadVaultItems = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const result = await getVaultList(user.id);
      if (result.success && Array.isArray(result.data)) {
        setVaultItems(result.data as VaultItem[]);
      } else if (!result.success) {
        toast.error("Failed to load vault items");
      } else {
        setVaultItems([]);
      }
    } catch (error) {
      console.error("Error loading vault items:", error);
      toast.error("Error loading vault items");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // 检查是否需要设置 PIN
    if (user && !PinManager.hasPin()) {
      setShowPinSetup(true);
    }
    
    // 同时检查订阅状态
    const checkSub = async () => {
      if (!user) return;
      const res = await getSubscriptionStatus(user.id);
      if (res.success && res.data && typeof res.data === "object" && "subscription" in res.data) {
        setSubActive((res.data as any).subscription.isActive);
      } else {
        setSubActive(false);
      }
    };

    checkSub();
    loadVaultItems();
  }, [user, loadVaultItems]);

  if (subActive === false) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
        <div>
          <h1 className="text-3xl font-bold mb-4">Legacy Vault 🔒</h1>
          <p className="text-gray-300 mb-6 max-w-md">
            Legacy Vault is available for Plus subscribers. Upgrade to unlock secure storage for your final messages and important documents.
          </p>
          <button
            onClick={() => router.push("/subscribe")}
            className="px-6 py-3 bg-primary text-white rounded-md hover:opacity-90 transition"
          >
            Upgrade to Plus
          </button>
        </div>
      </main>
    );
  }

  const handleDownload = async (item: VaultItem) => {
    if (!user) return;

    setDownloadingId(item.id);
    try {
      const result = await getVaultDownloadUrl(item.id, user.id);
      if (
        result.success &&
        typeof result.data === 'object' &&
        result.data !== null &&
        'downloadUrl' in result.data
      ) {
        const data = result.data as { downloadUrl: string; fileName?: string };

        if (item.encrypted) {
          // 需要解密
          const pin = PinManager.getPin();
          if (!pin) {
            toast.error("Please enter your PIN first");
            setDownloadingId(null);
            return;
          }

          const resp = await fetch(data.downloadUrl);
          const buf = await resp.arrayBuffer();
          const iv = new Uint8Array(buf.slice(0, 12));
          const ciphertext = buf.slice(12);
          try {
            const clear = await VaultCrypto.decryptFile({ iv, ciphertext }, pin, user.id);
            const mime = item.type === 'text' ? 'text/plain' : item.type === 'audio' ? 'audio/webm' : 'video/mp4';
            const blob = new Blob([clear], { type: mime });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = data.fileName || 'vault-file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("File decrypted & downloaded");
          } catch (e) {
            console.error("Decrypt error", e);
            toast.error("Decryption failed - wrong PIN?");
          }
        } else {
          // 直接下载
          const link = document.createElement('a');
          link.href = data.downloadUrl;
          link.download = data.fileName || 'vault-file';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success("Download started");
        }
      } else {
        toast.error("Failed to generate download link");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

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

  const handlePinSetup = (pin: string) => {
    PinManager.savePin(pin);
    setShowPinSetup(false);
    toast.success("PIN set successfully");
  };

  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Legacy Vault 🔒</h1>
          <p className="text-gray-300 mb-6">
            Securely store messages, videos, and important information to be delivered after you&apos;re gone.
          </p>
          <button
            onClick={() => router.push("/auth/request")}
            className="px-6 py-3 bg-primary text-white rounded-md hover:opacity-90 transition"
          >
            Sign In to Access Vault
          </button>
        </div>
      </main>
    );
  }

  if (showPinSetup) {
    return <PinSetupModal onSetPin={handlePinSetup} onCancel={() => setShowPinSetup(false)} />;
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-accent">Loading your vault...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Legacy Vault 🔒</h1>
            <p className="text-gray-300">
              Secure storage for your final messages and important documents
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-primary text-white rounded-md hover:opacity-90 transition"
          >
            + Add New Item
          </button>
        </div>

        {vaultItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl mb-2">Your vault is empty</h2>
            <p className="text-gray-400 mb-6">
              Start by creating your first legacy item. Messages, videos, or important documents.
            </p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-primary text-white rounded-md hover:opacity-90 transition"
            >
              Create First Item
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {vaultItems.map((item) => (
              <VaultItemCard 
                key={item.id} 
                item={item} 
                onDownload={() => handleDownload(item)}
                isDownloading={downloadingId === item.id}
              />
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">🔐 Security Notice</h3>
          <p className="text-sm text-gray-300">
            All files are encrypted with AES-256-GCM using your PIN. Your PIN is never stored on our servers.
            If you forget your PIN, your vault items cannot be recovered.
          </p>
        </div>
      </div>
    </main>
  );
}

function VaultItemCard({ 
  item, 
  onDownload, 
  isDownloading 
}: { 
  item: VaultItem; 
  onDownload: () => void;
  isDownloading: boolean;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "audio": return "🎵";
      case "video": return "🎬";
      case "text": return "📝";
      default: return "📄";
    }
  };

  const getTriggerText = (trigger: string, value: string) => {
    if (trigger === "fixed_date") {
      return `Deliver on ${new Date(value).toLocaleDateString()}`;
    }
    return `Deliver after ${value} of inactivity`;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getTypeIcon(item.type)}</span>
          <div>
            <h3 className="font-semibold">{item.storagePath.split('/').pop()}</h3>
            <p className="text-sm text-gray-400 capitalize">{item.type} file</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isDownloading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-300 space-y-1">
        <p>📅 {getTriggerText(item.trigger, item.triggerValue)}</p>
        <p>📆 Created: {new Date(item.createdAt).toLocaleDateString()}</p>
        <p>📊 Status: {item.delivered ? "✅ Delivered" : "⏳ Pending"}</p>
      </div>
    </div>
  );
}

function PinSetupModal({ onSetPin, onCancel }: { onSetPin: (pin: string) => void; onCancel: () => void }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    
    if (pin !== confirmPin) {
      setError("PINs don't match");
      return;
    }
    
    onSetPin(pin);
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Set Your Vault PIN</h2>
        <p className="text-gray-300 mb-6">
          Create a 4-digit PIN to encrypt your vault items. This PIN will be required to access your files.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Enter PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-center text-2xl tracking-widest"
              placeholder="••••"
              maxLength={6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Confirm PIN</label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-center text-2xl tracking-widest"
              placeholder="••••"
              maxLength={6}
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-md hover:opacity-90 transition"
            >
              Set PIN
            </button>
          </div>
        </form>
        
        <p className="text-xs text-gray-500 mt-4">
          ⚠️ Important: If you forget your PIN, your vault items cannot be recovered.
        </p>
      </div>
    </main>
  );
} 