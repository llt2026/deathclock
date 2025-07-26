"use client";
import { useState, useEffect } from "react";

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  vaultItems: number;
  dailyRegistrations: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    vaultItems: 0,
    dailyRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        activeSubscriptions: 89,
        vaultItems: 423,
        dailyRegistrations: 12,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const menuItems = [
    { name: "用户管理", icon: "👥", path: "/admin/users", description: "管理注册用户和权限" },
    { name: "订阅管理", icon: "💳", path: "/subscriptions", description: "查看和管理付费订阅" },
    { name: "遗嘱库管理", icon: "🗃️", path: "/vault", description: "监控Legacy Vault存储" },
    { name: "邮件日志", icon: "📧", path: "/emails", description: "查看邮件发送记录" },
    { name: "操作日志", icon: "📋", path: "/logs", description: "系统操作审计日志" },
    { name: "管理员管理", icon: "⚙️", path: "/admins", description: "管理后台用户权限" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">More Minutes 管理后台</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">管理员：admin@moreminutes.life</span>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃订阅</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</p>
              </div>
              <div className="text-3xl">💳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">遗嘱库文件</p>
                <p className="text-3xl font-bold text-blue-600">{stats.vaultItems}</p>
              </div>
              <div className="text-3xl">🗃️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今日新增</p>
                <p className="text-3xl font-bold text-purple-600">{stats.dailyRegistrations}</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => window.location.href = item.path}
              className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow border border-gray-200 hover:border-gray-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">最近活动</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">10:23</span>
                <span>用户 john@example.com 完成了Pro订阅</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">09:45</span>
                <span>新用户 sarah@example.com 注册账号</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">09:12</span>
                <span>用户 mike@example.com 上传了Legacy Vault文件</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">08:56</span>
                <span>PayPal Webhook 处理失败，订阅ID: SUB-123456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 