const { withSentryConfig } = require('@sentry/nextjs')

// Validate environment variables on build/start
require('./lib/env-check')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker
  output: 'standalone',
  // Custom webpack config for better Docker compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "ian-hh",
    project: "eagleeye-app",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }
)