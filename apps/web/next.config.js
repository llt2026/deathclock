/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除实验性功能以确保稳定部署
  images: {
    domains: [],
  },
  // 性能优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 安全头部
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // 输出配置
  output: 'standalone',
}

module.exports = nextConfig 