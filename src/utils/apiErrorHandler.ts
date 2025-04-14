import { captureException } from '@/features/monitoring';

/**
 * Standard API error types
 */
export enum ApiErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  SERVER = 'SERVER_ERROR',
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

/**
 * Standard API error class
 */
export class ApiError extends Error {
  /** HTTP status code */
  statusCode: number;
  /** Error type for categorization */
  errorType: ApiErrorType;
  /** Additional error details */
  details?: Record<string, unknown>;

  constructor(
    message: string, 
    statusCode: number = 500, 
    errorType: ApiErrorType = ApiErrorType.UNKNOWN,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
  }
}

/**
 * Map HTTP status codes to error types
 * @param statusCode - HTTP status code
 * @returns Corresponding API error type
 */
export function mapStatusToErrorType(statusCode: number): ApiErrorType {
  if (statusCode >= 400 && statusCode < 500) {
    if (statusCode === 400) return ApiErrorType.VALIDATION;
    if (statusCode === 401) return ApiErrorType.AUTHENTICATION;
    if (statusCode === 403) return ApiErrorType.AUTHORIZATION;
    if (statusCode === 404) return ApiErrorType.NOT_FOUND;
    if (statusCode === 429) return ApiErrorType.RATE_LIMIT;
    return ApiErrorType.VALIDATION;
  }
  
  if (statusCode >= 500) {
    return ApiErrorType.SERVER;
  }
  
  return ApiErrorType.UNKNOWN;
}

/**
 * Get a user-friendly error message based on error type
 * @param errorType - API error type
 * @returns User-friendly error message
 */
export function getFriendlyErrorMessage(errorType: ApiErrorType): string {
  switch (errorType) {
    case ApiErrorType.VALIDATION:
      return 'The request contains invalid data. Please check your input and try again.';
    case ApiErrorType.AUTHENTICATION:
      return 'Authentication failed. Please log in again.';
    case ApiErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ApiErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    case ApiErrorType.RATE_LIMIT:
      return 'Too many requests. Please try again later.';
    case ApiErrorType.SERVER:
      return 'The server encountered an error. Please try again later.';
    case ApiErrorType.NETWORK:
      return 'Network error. Please check your internet connection.';
    case ApiErrorType.TIMEOUT:
      return 'The request timed out. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Handle fetch response errors
 * @param response - Fetch Response object
 * @throws ApiError with appropriate type and message
 */
export async function handleFetchResponse(response: Response): Promise<Response> {
  if (!response.ok) {
    const errorType = mapStatusToErrorType(response.status);
    let errorMessage = getFriendlyErrorMessage(errorType);
    let errorDetails: Record<string, unknown> | undefined;
    
    // Try to parse error details from response
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      errorDetails = errorData;
    } catch {
      // Ignore JSON parsing errors
    }
    
    throw new ApiError(errorMessage, response.status, errorType, errorDetails);
  }
  
  return response;
}

/**
 * Handle network errors from fetch
 * @param error - Error from fetch
 * @throws ApiError with appropriate type and message
 */
export function handleFetchError(error: unknown): never {
  if (error instanceof Error) {
    let errorType = ApiErrorType.UNKNOWN;
    let statusCode = 0;
    
    // Determine error type based on error message
    if (error.name === 'AbortError') {
      errorType = ApiErrorType.TIMEOUT;
      statusCode = 408; // Request Timeout
    } else if (error.message.includes('NetworkError') || error.message.includes('network')) {
      errorType = ApiErrorType.NETWORK;
      statusCode = 0; // No HTTP status for network errors
    }
    
    throw new ApiError(
      getFriendlyErrorMessage(errorType),
      statusCode,
      errorType,
      { originalError: error.message }
    );
  }
  
  // For unknown errors
  throw new ApiError(
    getFriendlyErrorMessage(ApiErrorType.UNKNOWN),
    0,
    ApiErrorType.UNKNOWN,
    { originalError: error }
  );
}

/**
 * Safely execute a fetch request with error handling
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Response object
 * @throws ApiError with appropriate type and message
 */
export async function safeFetch(
  url: string, 
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return await handleFetchResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      // Re-throw ApiError
      throw error;
    }
    
    // Handle other errors
    handleFetchError(error);
    
    // This line is never reached, but TypeScript needs it
    throw error;
  }
}

/**
 * Safely execute a fetch request and parse JSON response
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws ApiError with appropriate type and message
 */
export async function safeJsonFetch<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  const response = await safeFetch(url, options);
  
  try {
    return await response.json() as T;
  } catch (error) {
    throw new ApiError(
      'Failed to parse JSON response',
      response.status,
      ApiErrorType.UNKNOWN,
      { originalError: error }
    );
  }
}

/**
 * Report API error to monitoring service
 * @param error - API error to report
 * @param context - Error context
 */
export function reportApiError(
  error: ApiError | Error | unknown,
  context: string
): void {
  if (error instanceof ApiError) {
    captureException(error, {
      tags: {
        errorType: error.errorType,
        statusCode: error.statusCode.toString(),
        context
      },
      extra: error.details
    });
  } else if (error instanceof Error) {
    captureException(error, {
      tags: {
        errorType: ApiErrorType.UNKNOWN,
        context
      }
    });
  } else {
    captureException(new Error('Unknown API error'), {
      tags: {
        errorType: ApiErrorType.UNKNOWN,
        context
      },
      extra: { originalError: error }
    });
  }
}
