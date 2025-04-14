// Mock Sentry implementation for development
// In a real application, this would use the actual Sentry SDK

// Severity levels type
export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

/**
 * Initialize Sentry
 */
export const initSentry = (): void => {
  console.log('Sentry mock initialized');
};

/**
 * Capture an exception
 * @param error - The error to capture
 * @param context - Additional context for the error
 */
export const captureException = (error: Error, context?: Record<string, unknown>): void => {
  // Log to console in development
  console.error('Error captured:', error);
  if (context) {
    console.error('Error context:', context);
  }
};

/**
 * Capture a message
 * @param message - The message to capture
 * @param level - The severity level of the message
 */
export const captureMessage = (message: string, level: SeverityLevel = 'info'): void => {
  // Log to console in development
  console.log(`[${level}] ${message}`);
};

/**
 * Set user information
 * @param user - The user information to set
 */
export const setUser = (user: { id: string; email?: string; username?: string }): void => {
  console.log('User set:', user);
};

/**
 * Clear user information
 */
export const clearUser = (): void => {
  console.log('User cleared');
};
