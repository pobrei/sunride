import { captureException, captureMessage } from '@/features/monitoring';

/**
 * Standard error types for better error categorization
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  NETWORK = 'NETWORK_ERROR',
  API = 'API_ERROR',
  FILE_PROCESSING = 'FILE_PROCESSING_ERROR',
  WEATHER = 'WEATHER_ERROR',
  GPX = 'GPX_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Interface for standardized error handling
 */
export interface ErrorHandlerOptions {
  /** Error context for better tracking */
  context: string;
  /** Whether to log the error to the console */
  logToConsole?: boolean;
  /** Whether to report the error to Sentry */
  reportToSentry?: boolean;
  /** Additional data to include with the error */
  additionalData?: Record<string, unknown>;
  /** Error type for categorization */
  errorType?: ErrorType;
}

/**
 * Default options for error handling
 */
const defaultOptions: Partial<ErrorHandlerOptions> = {
  logToConsole: true,
  reportToSentry: true,
  errorType: ErrorType.UNKNOWN,
};

/**
 * Handle errors in a standardized way across the application
 *
 * @param error - The error to handle
 * @param options - Options for error handling
 * @returns Formatted error message
 */
export function handleError(error: unknown, options: ErrorHandlerOptions): string {
  const mergedOptions = { ...defaultOptions, ...options };

  // Format the error message
  let errorMessage: string;
  let errorObject: Error;

  if (error instanceof Error) {
    errorMessage = error.message;
    errorObject = error;
  } else if (typeof error === 'string') {
    errorMessage = error;
    errorObject = new Error(error);
  } else {
    errorMessage = 'An unknown error occurred';
    errorObject = new Error(errorMessage);

    // Add the original error as a property
    (errorObject as any).originalError = error;
  }

  // Log to console if enabled
  if (mergedOptions.logToConsole) {
    console.error(`[${mergedOptions.context}] ${errorMessage}`, error);
  }

  // Report to Sentry if enabled
  if (mergedOptions.reportToSentry) {
    captureException(errorObject, {
      tags: {
        errorType: mergedOptions.errorType,
        context: mergedOptions.context,
      },
      extra: mergedOptions.additionalData,
    });
  }

  return errorMessage;
}

/**
 * Safely execute a function with standardized error handling
 *
 * @param fn - Function to execute
 * @param options - Error handling options
 * @returns Result of the function or undefined if an error occurred
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, options);
    return undefined;
  }
}

/**
 * Safely execute a function with a fallback value
 *
 * @param fn - Function to execute
 * @param fallback - Fallback value to return if an error occurs
 * @param options - Error handling options
 * @returns Result of the function or the fallback value
 */
export async function safeExecuteWithFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  options: ErrorHandlerOptions
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, options);
    return fallback;
  }
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Function to retry
 * @param options - Retry options
 * @returns Result of the function or throws an error after all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    context = 'retry',
    onRetry = (attempt: number, delay: number) => {},
  }: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    context?: string;
    onRetry?: (attempt: number, delay: number) => void;
  }
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          initialDelay * Math.pow(factor, attempt) * (0.8 + Math.random() * 0.4),
          maxDelay
        );

        // Log retry attempt
        console.warn(`Retry ${attempt + 1}/${maxRetries} for ${context} in ${delay.toFixed(0)}ms`);

        // Call onRetry callback
        onRetry(attempt + 1, delay);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If we get here, all retries failed
  throw lastError;
}
