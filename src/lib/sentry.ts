// Mock Sentry implementation for development
// In a real application, this would use the actual Sentry SDK

// Severity levels type
export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

// Initialize Sentry
export const initSentry = () => {
  console.log('Sentry mock initialized');
};

// Capture an exception
export const captureException = (error: Error, context?: Record<string, any>) => {
  // Log to console in development
  console.error('Error captured:', error);
  if (context) {
    console.error('Error context:', context);
  }
};

// Capture a message
export const captureMessage = (message: string, level: SeverityLevel = 'info') => {
  // Log to console in development
  console.log(`[${level}] ${message}`);
};

// Set user information
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  console.log('User set:', user);
};

// Clear user information
export const clearUser = () => {
  console.log('User cleared');
};
