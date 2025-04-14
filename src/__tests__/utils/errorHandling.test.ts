import { 
  AppError, 
  APIError, 
  NetworkError, 
  ValidationError, 
  AuthError, 
  PermissionError, 
  NotFoundError, 
  RateLimitError,
  tryCatch,
  tryCatchWithFallback,
  parseError,
  formatErrorMessage
} from '@/utils';

// Mock Sentry
jest.mock('@/lib/sentry', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

describe('Error Handling Utilities', () => {
  describe('Custom Error Classes', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 400, { test: true });
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.status).toBe(400);
      expect(error.details).toEqual({ test: true });
    });
    
    it('should create APIError with correct properties', () => {
      const error = new APIError('API error', 500, { test: true });
      
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(APIError);
      expect(error.message).toBe('API error');
      expect(error.code).toBe('API_ERROR');
      expect(error.status).toBe(500);
      expect(error.details).toEqual({ test: true });
    });
    
    it('should create NetworkError with correct properties', () => {
      const error = new NetworkError('Network error', { test: true });
      
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe('Network error');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.details).toEqual({ test: true });
    });
    
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Validation error', { test: true });
      
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Validation error');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.status).toBe(400);
      expect(error.details).toEqual({ test: true });
    });
  });
  
  describe('tryCatch', () => {
    it('should return the result of the function if successful', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await tryCatch(fn);
      
      expect(fn).toHaveBeenCalled();
      expect(result).toBe('success');
    });
    
    it('should return undefined if the function throws an error', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Test error'));
      const result = await tryCatch(fn);
      
      expect(fn).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
    
    it('should call the error handler if provided', async () => {
      const error = new Error('Test error');
      const fn = jest.fn().mockRejectedValue(error);
      const errorHandler = jest.fn();
      
      await tryCatch(fn, errorHandler);
      
      expect(errorHandler).toHaveBeenCalledWith(error);
    });
  });
  
  describe('tryCatchWithFallback', () => {
    it('should return the result of the function if successful', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await tryCatchWithFallback(fn, 'fallback');
      
      expect(fn).toHaveBeenCalled();
      expect(result).toBe('success');
    });
    
    it('should return the fallback value if the function throws an error', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Test error'));
      const result = await tryCatchWithFallback(fn, 'fallback');
      
      expect(fn).toHaveBeenCalled();
      expect(result).toBe('fallback');
    });
    
    it('should call the error handler if provided', async () => {
      const error = new Error('Test error');
      const fn = jest.fn().mockRejectedValue(error);
      const errorHandler = jest.fn();
      
      await tryCatchWithFallback(fn, 'fallback', errorHandler);
      
      expect(errorHandler).toHaveBeenCalledWith(error);
    });
  });
  
  describe('parseError', () => {
    it('should parse AppError correctly', () => {
      const error = new APIError('API error', 500, { test: true });
      const result = parseError(error);
      
      expect(result.message).toBe('API error');
      expect(result.code).toBe('API_ERROR');
      expect(result.status).toBe(500);
      expect(result.details).toEqual({ test: true });
    });
    
    it('should parse standard Error correctly', () => {
      const error = new Error('Standard error');
      const result = parseError(error);
      
      expect(result.message).toBe('Standard error');
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.details).toBeDefined();
      expect(result.details?.name).toBe('Error');
    });
    
    it('should parse string error correctly', () => {
      const result = parseError('String error');
      
      expect(result.message).toBe('String error');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });
    
    it('should handle unknown error types', () => {
      const result = parseError({ custom: 'error' });
      
      expect(result.message).toBe('An unknown error occurred');
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.details).toBeDefined();
      expect(result.details?.error).toEqual({ custom: 'error' });
    });
  });
  
  describe('formatErrorMessage', () => {
    it('should format API errors correctly', () => {
      const error = new APIError('Something went wrong');
      const message = formatErrorMessage(error);
      
      expect(message).toBe('API Error: Something went wrong');
    });
    
    it('should format network errors correctly', () => {
      const error = new NetworkError('Connection failed');
      const message = formatErrorMessage(error);
      
      expect(message).toBe('Network Error: Connection failed');
    });
    
    it('should format validation errors correctly', () => {
      const error = new ValidationError('Invalid input');
      const message = formatErrorMessage(error);
      
      expect(message).toBe('Validation Error: Invalid input');
    });
    
    it('should format unknown errors correctly', () => {
      const error = new Error('Unknown error');
      const message = formatErrorMessage(error);
      
      expect(message).toBe('Error: Unknown error');
    });
  });
});
