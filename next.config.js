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
  images: {
    domains: ['openweathermap.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        pathname: '/img/wn/**',
      },
    ],
  },
  output: 'standalone', // Optimized for Docker deployments
  poweredByHeader: false, // Removes the X-Powered-By header for security
  compress: true, // Enables gzip compression

  // Configure module resolution for the new folder structure
  serverExternalPackages: ['mongodb'],

  // Configure webpack to resolve paths from the new folder structure
  webpack: (
    config,
    {
      /* isServer */
    }
  ) => {
    // Add support for the new folder structure
    config.resolve.alias = {
      ...config.resolve.alias,
      '@frontend': '/frontend',
      '@backend': '/backend',
      '@shared': '/shared',
    };

    return config;
  },
};

module.exports = nextConfig;
