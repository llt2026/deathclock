"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { getUserProfile, updateUserProfile, exportUserData, getSubscriptionStatus } from "../../lib/api";
import USDatePicker from "../../components/USDatePicker";
import { toast } from "../../lib/toast";

interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  dob?: string;
  sex?: 'male' | 'female';
  createdAt: string;
}

interface SubscriptionInfo {
  status: string;
  tier: string;
  isActive: boolean;
  renewAt?: string;
  platform?: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Profile editing states
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState<'male' | 'female' | ''>("");

  const loadUserProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await getUserProfile(user.id);
      if (result.success && result.data) {
        const profileData = result.data;
        // set profile locally if needed (currently omitted)
        setDisplayName((profileData as { displayName?: string }).displayName ?? "");
        setBirthDate((profileData as { dob?: string }).dob ?? "");
        setSex((profileData as { sex?: 'male' | 'female' }).sex ?? "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, [user]);

  const loadSubscriptionInfo = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await getSubscriptionStatus(user.id);
      if (result.success && typeof result.data === 'object' && result.data !== null && 'subscription' in result.data) {
        setSubscription((result.data as { subscription: SubscriptionInfo }).subscription);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    }
  }, [user]);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setAnalyticsEnabled(localStorage.getItem('analytics_enabled') !== 'false');
      setEmailNotifications(localStorage.getItem('email_notifications') !== 'false');
    }
    
    if (user) {
      loadUserProfile();
      loadSubscriptionInfo();
    }
  }, [user, loadUserProfile, loadSubscriptionInfo]);

  const handleSaveProfile = async () => {
    if (!user || !editingProfile) return;

    setIsSaving(true);
    try {
      const profileData = {
        displayName: displayName.trim() || undefined,
        dob: birthDate || undefined,
        sex: sex || undefined,
      };

      const result = await updateUserProfile(user.id, profileData);
      if (result.success) {
        setProfile(prev => prev ? { ...prev, ...profileData } : null);
        setEditingProfile(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      const blob = await exportUserData(user.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moreminutes-data-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Data export completed");
      } else {
        toast.error("Failed to export data");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isDeletingAccount) {
      setIsDeletingAccount(true);
      return;
    }

    try {
      // TODO: Implement account deletion API call
      await signOut();
      router.push("/");
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Failed to delete account");
    }
  };

  const handleToggleAnalytics = (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    if (isClient) {
      localStorage.setItem('analytics_enabled', enabled.toString());
    }
  };

  const handleToggleNotifications = (enabled: boolean) => {
    setEmailNotifications(enabled);
    if (isClient) {
      localStorage.setItem('email_notifications', enabled.toString());
    }
  };

  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400">Please sign in to access settings.</p>
        <button
          onClick={() => router.push("/auth/request")}
          className="px-6 py-3 bg-primary text-white rounded-md hover:opacity-90 transition"
        >
          Sign In
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Profile Section */}
        <section className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <button
              onClick={() => editingProfile ? handleSaveProfile() : setEditingProfile(true)}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : editingProfile ? "Save" : "Edit"}
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!editingProfile}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md disabled:text-gray-400"
                placeholder="Enter your display name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Birth Date</label>
              <USDatePicker
                value={birthDate}
                onChange={setBirthDate}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md disabled:text-gray-400"
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
              />
              {!editingProfile && (
                <p className="text-xs text-accent mt-1">Edit to change your birth date</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'male' | 'female' | '')}
                disabled={!editingProfile}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md disabled:text-gray-400"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          {subscription ? (
            <div className="space-y-2">
              <p><span className="text-gray-400">Plan:</span> {subscription.tier}</p>
              <p><span className="text-gray-400">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  subscription.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {subscription.status}
                </span>
              </p>
              {subscription.renewAt && (
                <p><span className="text-gray-400">Renews:</span> {new Date(subscription.renewAt).toLocaleDateString()}</p>
              )}
              <button
                onClick={() => router.push("/subscribe")}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition"
              >
                Manage Subscription
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 mb-4">No active subscription</p>
              <button
                onClick={() => router.push("/subscribe")}
                className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition"
              >
                Subscribe Now
              </button>
            </div>
          )}
        </section>

        {/* Privacy Settings */}
        <section className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Privacy & Notifications</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-gray-400">Help us improve by sharing anonymous usage data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => handleToggleAnalytics(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive updates about your account and predictions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => handleToggleNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">Export Your Data</p>
              <p className="text-sm text-gray-400 mb-4">
                Download all your data including predictions, vault items, and account information.
              </p>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isExporting ? "Exporting..." : "Export Data"}
              </button>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Sign Out
            </button>
            
            <div>
              <p className="font-medium mb-2 text-red-400">Danger Zone</p>
              <p className="text-sm text-gray-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                className={`px-4 py-2 rounded transition ${
                  isDeletingAccount 
                    ? "bg-red-600 text-white hover:bg-red-700" 
                    : "bg-red-900 text-red-400 hover:bg-red-800"
                }`}
              >
                {isDeletingAccount ? "Confirm Delete Account" : "Delete Account"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
} 