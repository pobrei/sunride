/**
 * Utility types for common patterns
 */

/**
 * Result type for operations that might fail
 */
export interface Result<T> {
  /** The data returned by the operation, or null if it failed */
  data: T | null;
  /** The error that occurred, or null if the operation succeeded */
  error: Error | null;
  /** Whether the operation succeeded */
  success: boolean;
  /** Optional status code for API operations */
  status?: number;
}

/**
 * Creates a successful result
 * @param data - The data to return
 * @returns A successful result
 */
export function createSuccessResult<T>(data: T): Result<T> {
  return {
    data,
    error: null,
    success: true,
  };
}

/**
 * Creates a failed result
 * @param error - The error that occurred
 * @param status - Optional status code
 * @returns A failed result
 */
export function createErrorResult<T>(error: Error, status?: number): Result<T> {
  return {
    data: null,
    error,
    success: false,
    status,
  };
}

/**
 * Type for a function that can be memoized
 */
export type MemoizableFunction = (...args: unknown[]) => unknown;

/**
 * Type for a function with a cache
 */
export interface CachedFunction<T extends MemoizableFunction> {
  (...args: Parameters<T>): ReturnType<T>;
  /** Clear the cache */
  clearCache: () => void;
  /** Get the cache size */
  getCacheSize: () => number;
  /** Check if a key is in the cache */
  hasKey: (key: string) => boolean;
}

/**
 * Type for a loading state
 */
export interface LoadingState<T> {
  /** The data, or null if not loaded */
  data: T | null;
  /** Whether the data is loading */
  isLoading: boolean;
  /** The error that occurred, or null if no error */
  error: Error | null;
  /** Whether the operation has completed */
  isComplete: boolean;
}

/**
 * Type for a paginated result
 */
export interface PaginatedResult<T> {
  /** The items in the current page */
  items: T[];
  /** The total number of items across all pages */
  totalItems: number;
  /** The current page number (1-based) */
  currentPage: number;
  /** The total number of pages */
  totalPages: number;
  /** The number of items per page */
  pageSize: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Type for a validation error
 */
export interface ValidationError {
  /** The field that failed validation */
  field: string;
  /** The error message */
  message: string;
  /** The value that failed validation */
  value?: unknown;
}

/**
 * Type for a validation result
 */
export interface ValidationResult<T> {
  /** Whether the validation passed */
  isValid: boolean;
  /** The validated data, or null if validation failed */
  data: T | null;
  /** The validation errors */
  errors: ValidationError[];
}

/**
 * Type for a function that validates data
 */
export type Validator<T> = (data: unknown) => ValidationResult<T>;

/**
 * Type for a debounced function
 */
export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  /** Cancel any pending invocation */
  cancel: () => void;
  /** Immediately invoke the function */
  flush: () => ReturnType<T> | undefined;
}

/**
 * Type for a throttled function
 */
export interface ThrottledFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T>;
  /** Cancel any pending invocation */
  cancel: () => void;
}

/**
 * Type for a retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
  /** Whether to use exponential backoff */
  useExponentialBackoff: boolean;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
}

/**
 * Type for a rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests per time window */
  maxRequests: number;
  /** Time window in milliseconds */
  timeWindow: number;
}
