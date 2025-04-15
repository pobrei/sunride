/**
 * Environment configuration utility
 * Provides type-safe access to environment variables
 */

interface EnvConfig {
  // API Keys
  OPENWEATHER_API_KEY: string;
  openWeatherApiKey: string; // Alias for backward compatibility
  MAPBOX_ACCESS_TOKEN: string;

  // Database
  MONGODB_URI: string;
  mongodbUri: string; // Alias for backward compatibility

  // API URLs
  WEATHER_API_URL: string;

  // Feature flags
  ENABLE_OFFLINE_MODE: boolean;
  ENABLE_ANALYTICS: boolean;

  // App settings
  NODE_ENV: 'development' | 'production' | 'test';
  nodeEnv: 'development' | 'production' | 'test'; // Alias for backward compatibility
  APP_URL: string;

  // API rate limiting
  API_RATE_LIMIT: number;
  apiRateLimit: number;
  API_RATE_LIMIT_WINDOW_MS: number;
  apiRateLimitWindowMs: number;

  // Cache settings
  CACHE_DURATION: number;
  cacheDuration: number;

  // Debug mode
  DEBUG: boolean;
  debug: boolean;
}

/**
 * Get environment variable with type checking
 * @param key - Environment variable name
 * @param defaultValue - Default value if not found
 * @returns The environment variable value
 */
function getEnvVar<T extends keyof EnvConfig>(
  key: T,
  defaultValue?: EnvConfig[T]
): EnvConfig[T] {
  const value = process.env[key] as string | undefined;

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }

  // Convert to boolean if the type is boolean
  if (typeof defaultValue === 'boolean') {
    return (value.toLowerCase() === 'true') as unknown as EnvConfig[T];
  }

  return value as EnvConfig[T];
}

/**
 * Environment configuration with default values
 */
export const envConfig = {
  // API Keys
  OPENWEATHER_API_KEY: getEnvVar('OPENWEATHER_API_KEY', ''),
  get openWeatherApiKey() { return this.OPENWEATHER_API_KEY; }, // Alias for backward compatibility
  MAPBOX_ACCESS_TOKEN: getEnvVar('MAPBOX_ACCESS_TOKEN', ''),

  // Database
  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/weatherapp'),
  get mongodbUri() { return this.MONGODB_URI; }, // Alias for backward compatibility

  // API URLs
  WEATHER_API_URL: getEnvVar('WEATHER_API_URL', 'https://api.openweathermap.org/data/3.0'),

  // Feature flags
  ENABLE_OFFLINE_MODE: getEnvVar('ENABLE_OFFLINE_MODE', false),
  ENABLE_ANALYTICS: getEnvVar('ENABLE_ANALYTICS', false),

  // App settings
  NODE_ENV: getEnvVar('NODE_ENV', 'development') as EnvConfig['NODE_ENV'],
  get nodeEnv() { return this.NODE_ENV; }, // Alias for backward compatibility
  APP_URL: getEnvVar('APP_URL', 'http://localhost:3000'),

  // API rate limiting
  API_RATE_LIMIT: getEnvVar('API_RATE_LIMIT', 60),
  get apiRateLimit() { return this.API_RATE_LIMIT; },
  API_RATE_LIMIT_WINDOW_MS: getEnvVar('API_RATE_LIMIT_WINDOW_MS', 60000), // 1 minute
  get apiRateLimitWindowMs() { return this.API_RATE_LIMIT_WINDOW_MS; },

  // Cache settings
  CACHE_DURATION: getEnvVar('CACHE_DURATION', 3600000), // 1 hour
  get cacheDuration() { return this.CACHE_DURATION; },

  // Debug mode
  DEBUG: getEnvVar('DEBUG', process.env.NODE_ENV === 'development'),
  get debug() { return this.DEBUG; },
};

/**
 * Check if running in development mode
 */
export const isDevelopment = envConfig.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = envConfig.NODE_ENV === 'production';

/**
 * Check if running in test mode
 */
export const isTest = envConfig.NODE_ENV === 'test';
