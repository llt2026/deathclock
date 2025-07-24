"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setAnalyticsEnabled(localStorage.getItem('analytics_enabled') !== 'false');
      setEmailNotifications(localStorage.getItem('email_notifications') !== 'false');
    }
  }, []);

  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      // 收集用户数据
      const userData = {
        profile: {
          email: user?.email,
          created_at: user?.created_at,
        },
                 predictions: [], // 从 localStorage 或 API 获取
         settings: {
           theme: isClient ? (localStorage.getItem('theme') || 'dark') : 'dark',
           notifications: isClient ? (localStorage.getItem('notifications') !== 'false') : true,
         },
        exported_at: new Date().toISOString(),
      };

      // 创建下载
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moreminutes-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
    
    setIsExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsDeletingAccount(true);
    
    try {
      // 调用删除账户 API
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
                 headers: {
           'Authorization': `Bearer ${isClient ? localStorage.getItem('auth_token') : ''}`,
         },
      });

             if (response.ok) {
         await signOut();
         router.push('/');
         alert('Account deleted successfully.');
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Account deletion failed:', error);
      alert('Account deletion failed. Please contact support.');
    }
    
    setIsDeletingAccount(false);
  };

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-accent hover:text-white transition mb-4"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-display text-primary mb-2">Settings</h1>
        <p className="text-accent">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-accent mb-1">Email</label>
              <p className="text-white">{user?.email || 'Not signed in'}</p>
            </div>
            <div>
              <label className="block text-sm text-accent mb-1">Member Since</label>
              <p className="text-white">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Guest User'
                }
              </p>
            </div>
            <div>
              <label className="block text-sm text-accent mb-1">Subscription Status</label>
              <p className="text-white">Free User</p>
              <button
                onClick={() => router.push('/subscribe')}
                className="text-primary hover:underline text-sm mt-1"
              >
                Upgrade to Pro →
              </button>
            </div>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Privacy & Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Analytics Tracking</h3>
                <p className="text-accent text-sm">Help us improve the app with anonymous usage data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={analyticsEnabled}
                  onChange={(e) => {
                    setAnalyticsEnabled(e.target.checked);
                    if (isClient) {
                      localStorage.setItem('analytics_enabled', e.target.checked.toString());
                    }
                  }}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Email Notifications</h3>
                <p className="text-accent text-sm">Receive updates about new features and security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={emailNotifications}
                  onChange={(e) => {
                    setEmailNotifications(e.target.checked);
                    if (isClient) {
                      localStorage.setItem('email_notifications', e.target.checked.toString());
                    }
                  }}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Algorithm Transparency */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Algorithm Transparency</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-white font-medium mb-2">Data Source</h3>
              <p className="text-sm">
                Life expectancy calculations use the U.S. Social Security Administration's 2022 Period Life Table,
                which provides population-level mortality statistics and is in the public domain.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Methodology</h3>
              <p className="text-sm">
                We apply the Gompertz mortality model with parameters calibrated to SSA data (b=0.000045, c=1.098).
                A deterministic seed based on your profile ensures consistent results across sessions.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Privacy-First Design</h3>
              <p className="text-sm">
                All calculations are performed locally in your browser. Health data and risk factors
                never leave your device or get transmitted to our servers.
              </p>
            </div>
            
            <div className="bg-red-900/20 border border-red-800 rounded p-3">
              <p className="text-red-200 text-sm">
                <strong>Remember:</strong> These are statistical estimates for entertainment only.
                They do not constitute medical advice and should not influence important life decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Data Management</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Export Your Data</h3>
              <p className="text-accent text-sm mb-3">
                Download all your personal data in JSON format
              </p>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-white font-medium mb-2">Delete Account</h3>
              <p className="text-accent text-sm mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Support</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-white font-medium">Need Help?</h3>
              <p className="text-accent text-sm">
                Contact us at{' '}
                <a href="mailto:support@moreminutes.life" className="text-primary hover:underline">
                  support@moreminutes.life
                </a>
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium">Privacy Questions?</h3>
              <p className="text-accent text-sm">
                Email our privacy team at{' '}
                <a href="mailto:privacy@moreminutes.life" className="text-primary hover:underline">
                  privacy@moreminutes.life
                </a>
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium">Version</h3>
              <p className="text-accent text-sm">More Minutes v1.0.0</p>
            </div>
          </div>
        </section>

        {/* Sign Out */}
        {user && (
          <section className="bg-gray-900 rounded-lg p-6">
            <button
                             onClick={async () => {
                 await signOut();
                 router.push('/');
               }}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              Sign Out
            </button>
          </section>
        )}
      </div>
    </main>
  );
} 