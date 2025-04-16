/**
 * API response type definitions
 */

/**
 * API error types
 */
export enum ApiErrorType {
  /** Validation error */
  VALIDATION = 'VALIDATION_ERROR',
  /** Network error */
  NETWORK = 'NETWORK_ERROR',
  /** API error */
  API = 'API_ERROR',
  /** Authentication error */
  AUTH = 'AUTH_ERROR',
  /** Permission error */
  PERMISSION = 'PERMISSION_ERROR',
  /** Not found error */
  NOT_FOUND = 'NOT_FOUND_ERROR',
  /** Rate limit error */
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  /** Unknown error */
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * API error interface
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** Error code */
  code: ApiErrorType;
  /** HTTP status code */
  status?: number;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Base API response interface
 */
export interface ApiResponse<T = unknown> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data (only present if success is true) */
  data?: T;
  /** Error message (only present if success is false) */
  error?: string;
  /** Error code (only present if success is false) */
  code?: string;
  /** HTTP status code */
  status?: number;
}

/**
 * Weather API response
 */
export interface WeatherApiResponse<T = unknown> extends ApiResponse<T> {
  /** Weather data source (e.g., 'openweathermap', 'mock') */
  source?: string;
  /** Weather data provider */
  provider?: string;
  /** Timestamp when the data was fetched */
  timestamp?: number;
  /** Whether the data was retrieved from cache */
  cached?: boolean;
  /** Number of points processed */
  pointsProcessed?: number;
}

/**
 * GPX API response
 */
export interface GpxApiResponse<T = unknown> extends ApiResponse<T> {
  /** Filename of the uploaded GPX file */
  filename?: string;
  /** Size of the uploaded GPX file in bytes */
  fileSize?: number;
  /** Timestamp when the file was uploaded */
  uploadedAt?: number;
}

/**
 * Error response with validation details
 */
export interface ValidationErrorResponse extends ApiResponse<null> {
  /** Validation errors by field */
  validationErrors?: Record<string, string[]>;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  /** Total number of items */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPrevPage: boolean;
}
