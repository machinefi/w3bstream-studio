// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  output: 'standalone',
  publicRuntimeConfig: {
    NEXT_PUBLIC_GATEWAY_HTTP_URL: process.env["NEXT_PUBLIC_GATEWAY_HTTP_URL"],
    NEXT_PUBLIC_GATEWAY_MQTT_URL: process.env["NEXT_PUBLIC_GATEWAY_MQTT_URL"]
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
