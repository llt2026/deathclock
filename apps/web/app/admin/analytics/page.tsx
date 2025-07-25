"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalPredictions: number;
    totalVaultItems: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    estimatedMRR: number;
  };
  growth: {
    usersLast7Days: number;
    usersLast30Days: number;
    predictionsLast7Days: number;
    vaultLast7Days: number;
    subscriptionsLast7Days: number;
  };
  conversion: {
    signupToSubscription: string;
    predictionToSignup: string;
    signupToVault: string;
  };
  trends: {
    dailyRegistrations: Array<{ date: string; count: number }>;
    dailyPredictions: Array<{ date: string; count: number }>;
  };
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        loadAnalytics();
      } else {
        setError("Invalid admin token");
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        setError("Failed to load analytics data");
      }
    } catch (err) {
      setError("Error loading analytics");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Token</label>
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md"
                placeholder="Enter admin token"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-3 bg-primary text-white rounded-md hover:opacity-90 transition"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen p-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-400">Loading analytics...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
          >
            ← Back to Admin
          </button>
        </div>

        {data && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title="Total Users" 
                value={data.overview.totalUsers.toLocaleString()} 
                growth={data.growth.usersLast7Days}
                growthLabel="Last 7 days"
              />
              <StatCard 
                title="Total Predictions" 
                value={data.overview.totalPredictions.toLocaleString()} 
                growth={data.growth.predictionsLast7Days}
                growthLabel="Last 7 days"
              />
              <StatCard 
                title="Active Subscriptions" 
                value={data.overview.activeSubscriptions.toLocaleString()} 
                growth={data.growth.subscriptionsLast7Days}
                growthLabel="Last 7 days"
              />
              <StatCard 
                title="Vault Items" 
                value={data.overview.totalVaultItems.toLocaleString()} 
                growth={data.growth.vaultLast7Days}
                growthLabel="Last 7 days"
              />
              <StatCard 
                title="Estimated MRR" 
                value={`$${data.overview.estimatedMRR.toFixed(2)}`} 
                growth={null}
                growthLabel=""
              />
              <StatCard 
                title="Total Subscriptions" 
                value={data.overview.totalSubscriptions.toLocaleString()} 
                growth={null}
                growthLabel=""
              />
            </div>

            {/* Conversion Rates */}
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">Conversion Rates</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{data.conversion.predictionToSignup}%</p>
                  <p className="text-sm text-gray-400">Prediction → Signup</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{data.conversion.signupToSubscription}%</p>
                  <p className="text-sm text-gray-400">Signup → Subscription</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{data.conversion.signupToVault}%</p>
                  <p className="text-sm text-gray-400">Signup → Vault Usage</p>
                </div>
              </div>
            </div>

            {/* Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <TrendChart 
                title="Daily Registrations (Last 30 Days)"
                data={data.trends.dailyRegistrations}
                color="#00C48C"
              />
              <TrendChart 
                title="Daily Predictions (Last 30 Days)"
                data={data.trends.dailyPredictions}
                color="#E50914"
              />
            </div>

            {/* External Analytics Info */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">External Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Vercel Analytics</h3>
                  <p className="text-sm text-gray-400 mb-2">
                    View detailed web analytics in your Vercel dashboard:
                  </p>
                  <a 
                    href="https://vercel.com/analytics" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm"
                  >
                    Open Vercel Analytics →
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">TikTok Events</h3>
                  <p className="text-sm text-gray-400 mb-2">
                    View TikTok pixel events in TikTok Events Manager:
                  </p>
                  <a 
                    href="https://business.tiktok.com/events" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm"
                  >
                    Open TikTok Events Manager →
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ 
  title, 
  value, 
  growth, 
  growthLabel 
}: { 
  title: string; 
  value: string; 
  growth: number | null; 
  growthLabel: string; 
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {growth !== null && (
        <p className="text-sm text-gray-400 mt-2">
          +{growth} {growthLabel}
        </p>
      )}
    </div>
  );
}

function TrendChart({ 
  title, 
  data, 
  color 
}: { 
  title: string; 
  data: Array<{ date: string; count: number }>; 
  color: string; 
}) {
  const maxValue = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {data.slice(-7).map((item, index) => (
          <div key={item.date} className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {new Date(item.date).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-2 flex-1 mx-4">
              <div 
                className="h-2 rounded"
                style={{ 
                  backgroundColor: color,
                  width: `${(item.count / maxValue) * 100}%`,
                  minWidth: '4px'
                }}
              />
              <span className="text-sm font-medium">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 