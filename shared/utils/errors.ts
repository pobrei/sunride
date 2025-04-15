/**
 * Custom error types for the application
 */

/**
 * Error types enum
 */
export enum ErrorType {
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
  /** GPX parsing error */
  GPX = 'GPX_ERROR',
  /** Weather API error */
  WEATHER = 'WEATHER_ERROR',
  /** Timeout error */
  TIMEOUT = 'TIMEOUT_ERROR',
  /** Unknown error */
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Base custom error class
 */
export class AppError extends Error {
  /** Error code */
  code: ErrorType;
  /** HTTP status code */
  status?: number;
  /** Additional error details */
  details?: Record<string, unknown>;

  /**
   * Create a new AppError
   * @param message Error message
   * @param code Error code
   * @param status HTTP status code
   * @param details Additional error details
   */
  constructor(
    message: string,
    code: ErrorType = ErrorType.UNKNOWN,
    status?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;

    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends AppError {
  /**
   * Create a new ValidationError
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorType.VALIDATION, 400, details);
    this.name = 'ValidationError';

    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when a network request fails
 */
export class NetworkError extends AppError {
  /**
   * Create a new NetworkError
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorType.NETWORK, 503, details);
    this.name = 'NetworkError';

    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error thrown when an API request fails
 */
export class APIError extends AppError {
  /**
   * Create a new APIError
   * @param message Error message
   * @param status HTTP status code
   * @param details Additional error details
   */
  constructor(message: string, status = 500, details?: Record<string, unknown>) {
    super(message, ErrorType.API, status, details);
    this.name = 'APIError';

    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthError extends AppError {
  /**
   * Create a new AuthError
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorType.AUTH, 401, details);
    this.name = 'AuthError';

    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Error thrown when a resource is not found
 */
export class NotFoundError extends AppError {
  /**
   * Create a new NotFoundError
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorType.NOT_FOUND, 404, details);
    this.name = 'NotFoundError';

    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown when a timeout occurs
 */
export class TimeoutError extends AppError {
  /**
   * Create a new TimeoutError
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message: string = 'Operation timed out', details?: Record<string, unknown>) {
    super(message, ErrorType.TIMEOUT, 408, details);
    this.name = 'TimeoutError';

    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Error thrown when GPX parsing fails
 */
export class GPXError extends AppError {
  /**
   * Create a new GPXError
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorType.GPX, 400, details);
    this.name = 'GPXError';

    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, GPXError.prototype);
  }
}

/**
 * Error thrown when a weather API request fails
 */
export class WeatherError extends AppError {
  /**
   * Create a new WeatherError
   * @param message Error message
   * @param status HTTP status code
   * @param details Additional error details
   */
  constructor(message: string, status = 500, details?: Record<string, unknown>) {
    super(message, ErrorType.WEATHER, status, details);
    this.name = 'WeatherError';

    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, WeatherError.prototype);
  }
}
