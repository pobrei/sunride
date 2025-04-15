/**
 * Environment variable configuration
 *
 * This file validates and provides access to environment variables.
 * It ensures that required environment variables are present and
 * provides type-safe access to them.
 */

// Define the shape of the environment variables
interface Env {
  // API Keys
  OPENWEATHER_API_KEY: string;
  WEATHERAPI_KEY?: string;
  VISUALCROSSING_API_KEY?: string;
  TOMORROW_IO_API_KEY?: string;

  // Database
  MONGODB_URI: string;

  // Sentry
  NEXT_PUBLIC_SENTRY_DSN?: string;
  SENTRY_AUTH_TOKEN?: string;
  SENTRY_PROJECT?: string;
  SENTRY_ORG?: string;

  // API Rate Limiting
  API_RATE_LIMIT?: string;
  API_RATE_LIMIT_WINDOW_MS?: string;

  // Caching
  CACHE_DURATION?: string;

  // Debugging
  DEBUG?: string;

  // Map Services
  MAPBOX_ACCESS_TOKEN?: string;
  GOOGLE_MAPS_API_KEY?: string;

  // Feature Flags
  ENABLE_WEATHER_PROVIDER_COMPARISON?: string;
  ENABLE_OFFLINE_MODE?: string;
  ENABLE_ADVANCED_CHARTS?: string;

  // Analytics
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?: string;
  NEXT_PUBLIC_POSTHOG_API_KEY?: string;
  NEXT_PUBLIC_POSTHOG_HOST?: string;

  // Security
  NEXTAUTH_URL?: string;
  NEXTAUTH_SECRET?: string;
  JWT_SECRET?: string;

  // Deployment
  VERCEL_URL?: string;
  VERCEL_ENV?: string;
  NODE_ENV: string;
}

// Define the required environment variables
const requiredEnvVars: Array<keyof Env> = ['OPENWEATHER_API_KEY', 'MONGODB_URI', 'NODE_ENV'];

// Get the environment variables
const env = process.env as unknown as Env;

// Validate the required environment variables
for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Parse numeric environment variables
const apiRateLimit = env.API_RATE_LIMIT ? parseInt(env.API_RATE_LIMIT, 10) : 100;
const apiRateLimitWindowMs = env.API_RATE_LIMIT_WINDOW_MS
  ? parseInt(env.API_RATE_LIMIT_WINDOW_MS, 10)
  : 60000;
const cacheDuration = env.CACHE_DURATION ? parseInt(env.CACHE_DURATION, 10) : 3600000; // Default: 1 hour

// Parse boolean environment variables
const enableWeatherProviderComparison = env.ENABLE_WEATHER_PROVIDER_COMPARISON === 'true';
const enableOfflineMode = env.ENABLE_OFFLINE_MODE === 'true';
const enableAdvancedCharts = env.ENABLE_ADVANCED_CHARTS === 'true';
const debug = env.DEBUG === 'true';

// Determine the environment
const isDevelopment = env.NODE_ENV === 'development';
const isProduction = env.NODE_ENV === 'production';
const isTest = env.NODE_ENV === 'test';

// Export the environment variables
export const envConfig = {
  // API Keys
  openWeatherApiKey: env.OPENWEATHER_API_KEY,
  weatherApiKey: env.WEATHERAPI_KEY,
  visualCrossingApiKey: env.VISUALCROSSING_API_KEY,
  tomorrowIoApiKey: env.TOMORROW_IO_API_KEY,

  // Database
  mongodbUri: env.MONGODB_URI,

  // Sentry
  sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
  sentryAuthToken: env.SENTRY_AUTH_TOKEN,
  sentryProject: env.SENTRY_PROJECT,
  sentryOrg: env.SENTRY_ORG,

  // API Rate Limiting
  apiRateLimit,
  apiRateLimitWindowMs,

  // Caching and Debugging
  cacheDuration,
  debug,

  // Map Services
  mapboxAccessToken: env.MAPBOX_ACCESS_TOKEN,
  googleMapsApiKey: env.GOOGLE_MAPS_API_KEY,

  // Feature Flags
  enableWeatherProviderComparison,
  enableOfflineMode,
  enableAdvancedCharts,

  // Analytics
  googleAnalyticsId: env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
  posthogApiKey: env.NEXT_PUBLIC_POSTHOG_API_KEY,
  posthogHost: env.NEXT_PUBLIC_POSTHOG_HOST,

  // Security
  nextAuthUrl: env.NEXTAUTH_URL,
  nextAuthSecret: env.NEXTAUTH_SECRET,
  jwtSecret: env.JWT_SECRET,

  // Deployment
  vercelUrl: env.VERCEL_URL,
  vercelEnv: env.VERCEL_ENV,

  // Environment
  isDevelopment,
  isProduction,
  isTest,
  nodeEnv: env.NODE_ENV,
};

/**
 * Validates that an API key is present
 *
 * @param apiKey - The API key to validate
 * @param name - The name of the API key
 * @returns The API key if valid
 * @throws Error if the API key is missing
 */
export function validateApiKey(apiKey: string | undefined, name: string): string {
  if (!apiKey) {
    throw new Error(`Missing API key: ${name}`);
  }
  return apiKey;
}
