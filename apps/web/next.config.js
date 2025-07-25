/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@moreminutes/core', '@moreminutes/db'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/packages': require('path').resolve(__dirname, '../../packages'),
    };
    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  headers: async () => {
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
};

module.exports = nextConfig; 