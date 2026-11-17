import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  turbopack: {
    resolveAlias: {
      'node:fs/promises': { browser: './src/lib/shims/fsPromises.ts' },
    },
  },
};

export default nextConfig;
