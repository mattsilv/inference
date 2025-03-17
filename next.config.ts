import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optimize for development
  webpack: (config, { dev, isServer }) => {
    // For faster development experience
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay the rebuild for 300ms
      };
    }
    return config;
  },
};

export default nextConfig;