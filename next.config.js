// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  output: 'standalone',
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
  },
  async rewrites() {
    return [
      {
        source: '/api/w3bapp/event/:path*',
        destination: `${process.env.NEXT_PUBLIC_EVENT_URL}/srv-applet-mgr/v0/event/:path*`
      },
      {
        source: '/api/w3bapp/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/:path*`
      }
    ];
  }
};

// const withBundleAnalyzer = require('@next/bundle-analyzer')();
// module.exports = withBundleAnalyzer(nextConfig);

module.exports = nextConfig;
