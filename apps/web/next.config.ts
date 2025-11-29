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
  webpack: (config, { isServer }) => {
    // Resolve shared library paths for webpack
    // Point to libs/shared so that @nx-mono-repo-deployment-test/shared/src/... resolves correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@nx-mono-repo-deployment-test/shared': path.resolve(__dirname, '../../libs/shared'),
    };
    
    return config;
  },
};

export default nextConfig;

