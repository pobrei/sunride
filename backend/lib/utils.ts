/**
 * Utility functions for backend services
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@shared/types/api-response';

/**
 * Create a successful API response
 * @param data - The data to include in the response
 * @returns A formatted API response object
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create an error API response
 * @param error - The error message or object
 * @param statusCode - HTTP status code
 * @returns A formatted API error response object
 */
export function createErrorResponse(error: string | Error, statusCode = 500): ApiResponse<null> {
  const errorMessage = error instanceof Error ? error.message : error;

  return {
    success: false,
    error: errorMessage,
    status: statusCode,
  };
}

/**
 * Handle API errors and return a formatted response
 * @param error - The error object
 * @returns A NextResponse with the error details
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse<null>> {
  console.error('API Error:', error);

  const errorMessage = error instanceof Error
    ? error.message
    : 'An unexpected error occurred';

  const statusCode = error instanceof Error && 'statusCode' in error
    ? (error as any).statusCode
    : 500;

  return NextResponse.json(
    createErrorResponse(errorMessage, statusCode),
    { status: statusCode }
  );
}

/**
 * Parse JSON body from request with error handling
 * @param request - The Next.js request object
 * @returns The parsed JSON body
 */
export async function parseJsonBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json() as T;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Validate required fields in an object
 * @param obj - The object to validate
 * @param requiredFields - Array of required field names
 * @throws Error if any required fields are missing
 */
export function validateRequiredFields(obj: Record<string, any>, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => obj[field] === undefined);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Safely parse a string to a number
 * @param value - The string value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns The parsed number or default value
 */
export function parseNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;

  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parse a string to a boolean
 * @param value - The string value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns The parsed boolean or default value
 */
export function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;

  return value.toLowerCase() === 'true';
}

/**
 * Safely parse a string to a date
 * @param value - The string value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns The parsed date or default value
 */
export function parseDate(value: string | undefined, defaultValue: Date): Date {
  if (value === undefined) return defaultValue;

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? defaultValue : parsed;
}

/**
 * Delay execution for a specified time
 * @param ms - Milliseconds to delay
 * @returns A promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param fn - The function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns The result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 300
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Calculate exponential backoff delay
      const delayMs = baseDelay * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }

  throw lastError || new Error('Function failed after retries');
}
