import { captureException } from '@/lib/sentry';

/**
 * Custom error types for better error handling
 */
export class AppError extends Error {
  /** Error code for categorizing errors */
  code: string;
  /** HTTP status code if applicable */
  status?: number;
  /** Additional error details */
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code = 'UNKNOWN_ERROR',
    status?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * API-related errors
 */
export class APIError extends AppError {
  constructor(message: string, status = 500, details?: Record<string, unknown>) {
    super(message, 'API_ERROR', status, details);
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', undefined, details);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Authentication errors
 */
export class AuthError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', 401, details);
  }
}

/**
 * Permission errors
 */
export class PermissionError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'PERMISSION_ERROR', 403, details);
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'NOT_FOUND_ERROR', 404, details);
  }
}

/**
 * Rate limit errors
 */
export class RateLimitError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'RATE_LIMIT_ERROR', 429, details);
  }
}

/**
 * Safely executes a function and handles any errors
 *
 * @param fn - The function to execute
 * @param errorHandler - Optional custom error handler
 * @returns The result of the function or undefined if an error occurred
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      // Default error handling
      console.error('Error caught in tryCatch:', error);

      // Report to Sentry if available
      if (typeof captureException === 'function') {
        captureException(error);
      }
    }
    return undefined;
  }
}

/**
 * Safely executes a function and handles any errors with a fallback value
 *
 * @param fn - The function to execute
 * @param fallback - The fallback value to return if an error occurs
 * @param errorHandler - Optional custom error handler
 * @returns The result of the function or the fallback value if an error occurred
 */
export async function tryCatchWithFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorHandler?: (error: unknown) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      // Default error handling
      console.error('Error caught in tryCatchWithFallback:', error);

      // Report to Sentry if available
      if (typeof captureException === 'function') {
        captureException(error);
      }
    }
    return fallback;
  }
}

/**
 * Parses an unknown error into a structured error object
 *
 * @param error - The error to parse
 * @returns A structured error object
 */
export function parseError(error: unknown): {
  message: string;
  code: string;
  status?: number;
  details?: Record<string, unknown>;
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      details: { name: error.name, stack: error.stack },
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    details: { error },
  };
}

/**
 * Formats an error message for display to the user
 *
 * @param error - The error to format
 * @returns A user-friendly error message
 */
export function formatErrorMessage(error: unknown): string {
  const parsedError = parseError(error);

  // Return a user-friendly message based on the error code
  switch (parsedError.code) {
    case 'API_ERROR':
      return `API Error: ${parsedError.message}`;
    case 'NETWORK_ERROR':
      return `Network Error: ${parsedError.message}`;
    case 'VALIDATION_ERROR':
      return `Validation Error: ${parsedError.message}`;
    case 'AUTH_ERROR':
      return `Authentication Error: ${parsedError.message}`;
    case 'PERMISSION_ERROR':
      return `Permission Error: ${parsedError.message}`;
    case 'NOT_FOUND_ERROR':
      return `Not Found: ${parsedError.message}`;
    case 'RATE_LIMIT_ERROR':
      return `Rate Limit Exceeded: ${parsedError.message}`;
    default:
      return `Error: ${parsedError.message}`;
  }
}
