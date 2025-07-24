/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@moreminutes/core", "@moreminutes/db"],
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
};

module.exports = nextConfig; 