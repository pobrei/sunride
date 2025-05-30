// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },

  // Performance optimizations
  experimental: {
    optimizeCss: false, // Temporarily disabled due to critters dependency issue
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'chart.js',
      'react-chartjs-2',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
  },

  // Image optimization
  images: {
    domains: ['openweathermap.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        pathname: '/img/wn/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security and performance headers
  output: 'standalone', // Optimized for Docker deployments
  poweredByHeader: false, // Removes the X-Powered-By header for security
  compress: true, // Enables gzip compression

  // Configure module resolution for the new folder structure
  serverExternalPackages: ['mongodb'],

  // Enhanced webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Add support for the new folder structure
    config.resolve.alias = {
      ...config.resolve.alias,
      '@frontend': '/frontend',
      '@backend': '/backend',
      '@shared': '/shared',
    };

    // Optimize bundle splitting
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|recharts|react-chartjs-2)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 20,
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|framer-motion)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
          },
        },
      };
    }

    // Tree shaking optimization (disabled usedExports due to cacheUnaffected conflict)
    // config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
