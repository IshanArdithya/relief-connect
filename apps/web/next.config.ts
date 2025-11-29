import type { NextConfig } from 'next';
import path from 'path';

const nextI18nextConfig = require('./next-i18next.config.js');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@nx-mono-repo-deployment-test/shared'],
  experimental: {
    externalDir: true,
  },
  i18n: nextI18nextConfig.i18n,
  typescript: {
    // Skip type checking for shared library files (they may have backend-only dependencies)
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    // Resolve shared library paths for webpack
    // The alias handles the base path, wildcard paths are resolved relative to this
    config.resolve.alias = {
      ...config.resolve.alias,
      '@nx-mono-repo-deployment-test/shared': path.resolve(__dirname, '../../libs/shared'),
    };
    
    return config;
  },
};

export default nextConfig;

