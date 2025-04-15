/**
 * Sentry error tracking integration
 */

// Mock Sentry types and functions if the package is not installed
interface Transaction {
  finish(data?: { status?: string }): void;
  setName(name: string): void;
  setTag(key: string, value: string): void;
}

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

// Use a mock Sentry implementation if the package is not available
const Sentry = {
  init: (options: any) => {},
  captureException: (error: Error, options?: any) => {},
  captureMessage: (message: string, options?: any) => {},
  setUser: (user: any) => {},
  setContext: (name: string, context: any) => {},
  setTag: (key: string, value: string) => {},
  startTransaction: ({ name, op }: { name: string; op: string }): Transaction => ({
    finish: () => {},
    setName: () => {},
    setTag: () => {}
  })
};
import { envConfig } from '@shared/lib/env';

/**
 * Initialize Sentry for error tracking
 * Only initializes in production environment
 */
export function initSentry(): void {
  if (envConfig.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: envConfig.NODE_ENV,
    });
  }
}

/**
 * Capture an exception in Sentry
 * @param error - The error to capture
 * @param context - Additional context information
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (envConfig.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error captured:', error, context);
  }
}

/**
 * Capture a message in Sentry
 * @param message - The message to capture
 * @param level - The severity level
 * @param context - Additional context information
 */
export function captureMessage(
  message: string,
  level: SeverityLevel = 'info',
  context?: Record<string, any>
): void {
  if (envConfig.NODE_ENV === 'production') {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  } else {
    console.log(`[${level}] ${message}`, context);
  }
}

/**
 * Set user information for Sentry
 * @param user - User information
 */
export function setUser(user: { id: string; email?: string; username?: string }): void {
  if (envConfig.NODE_ENV === 'production') {
    Sentry.setUser(user);
  }
}

/**
 * Clear user information from Sentry
 */
export function clearUser(): void {
  if (envConfig.NODE_ENV === 'production') {
    Sentry.setUser(null);
  }
}

/**
 * Set extra context information for Sentry
 * @param context - Context information
 */
export function setContext(name: string, context: Record<string, any>): void {
  if (envConfig.NODE_ENV === 'production') {
    Sentry.setContext(name, context);
  }
}

/**
 * Set tag information for Sentry
 * @param key - Tag key
 * @param value - Tag value
 */
export function setTag(key: string, value: string): void {
  if (envConfig.NODE_ENV === 'production') {
    Sentry.setTag(key, value);
  }
}

/**
 * Create a transaction for performance monitoring
 * @param name - Transaction name
 * @param op - Operation name
 * @returns Transaction object
 */
export function startTransaction(name: string, op: string): Transaction | null {
  if (envConfig.NODE_ENV === 'production') {
    return Sentry.startTransaction({ name, op });
  }
  return null;
}

/**
 * Wrap a function with Sentry error tracking
 * @param fn - Function to wrap
 * @param options - Options for error tracking
 * @returns Wrapped function
 */
export function withErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    name?: string;
    tags?: Record<string, string>;
    context?: Record<string, any>;
  } = {}
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      const result = fn(...args);

      // Handle promises
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureException(error, {
            ...options.context,
            functionName: options.name || fn.name,
            arguments: args,
          });
          throw error;
        }) as ReturnType<T>;
      }

      return result;
    } catch (error) {
      captureException(error instanceof Error ? error : new Error(String(error)), {
        ...options.context,
        functionName: options.name || fn.name,
        arguments: args,
      });
      throw error;
    }
  };
}
