const nextConfig = {
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
      path: false,
    };
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  }
};

module.exports = nextConfig;
