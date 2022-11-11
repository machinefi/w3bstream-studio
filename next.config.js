// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  output: 'standalone',
  publicRuntimeConfig: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3001',
    SERVER_BASE_PATH: 'http://localhost:8888/srv-applet-mgr/v0'
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      topLevelAwait: true,
      layers: true
    };
    config.resolve.fallback = {
      fs: false,
      process: false,
      buffer: false,
      module: false,
      path: false
    };
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  }
};

// const withBundleAnalyzer = require('@next/bundle-analyzer')();
// module.exports = withBundleAnalyzer(nextConfig);

module.exports = nextConfig;
