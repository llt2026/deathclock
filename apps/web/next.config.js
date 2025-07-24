/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基础配置
  images: {
    domains: [],
    unoptimized: false,
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
}

module.exports = nextConfig 