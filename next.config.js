const nextConfig = {
  experimental: {
    outputStandalone: true
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

if (process.env['STANDALONE'] === 'true') {
  nextConfig.experimental.outputStandalone = true;
}

module.exports = nextConfig;
