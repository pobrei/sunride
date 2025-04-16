/**
 * Custom error classes for better error handling
 */

/**
 * API error with status code
 */
export class APIError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    
    // This is needed to make instanceof work correctly with transpiled classes
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Network error for connection issues
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
    
    // This is needed to make instanceof work correctly with transpiled classes
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Validation error for invalid data
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    
    // This is needed to make instanceof work correctly with transpiled classes
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
