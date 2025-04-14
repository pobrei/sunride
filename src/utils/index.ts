// Export all utilities
export * from './classNames';

// Handle conflicting error exports
export * from './errorHandling';

// Import and re-export from errors.ts with renamed exports to avoid conflicts
import {
  ValidationError as SimpleValidationError,
  APIError as SimpleAPIError,
  AuthError,
  NotFoundError
} from './errors';

export {
  SimpleValidationError,
  SimpleAPIError,
  AuthError,
  NotFoundError
};

export * from './formatUtils';
export * from './performance';
export * from './typeGuards';
