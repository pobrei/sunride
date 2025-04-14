/**
 * Utility functions for validating user input
 */

/**
 * Validates that a value is not empty
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} is required`);
  }
}

/**
 * Validates that a string has a minimum length
 * @param value - String to validate
 * @param minLength - Minimum length
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): void {
  if (value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }
}

/**
 * Validates that a string has a maximum length
 * @param value - String to validate
 * @param maxLength - Maximum length
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): void {
  if (value.length > maxLength) {
    throw new Error(`${fieldName} must be no more than ${maxLength} characters`);
  }
}

/**
 * Validates that a value is a number
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export function validateNumber(value: any, fieldName: string): void {
  if (isNaN(Number(value))) {
    throw new Error(`${fieldName} must be a number`);
  }
}

/**
 * Validates that a number is within a range
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export function validateRange(value: number, min: number, max: number, fieldName: string): void {
  if (value < min || value > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
}

/**
 * Validates that a value matches a regular expression
 * @param value - Value to validate
 * @param pattern - Regular expression pattern
 * @param fieldName - Name of the field for error message
 * @param errorMessage - Custom error message
 * @throws Error if validation fails
 */
export function validatePattern(
  value: string, 
  pattern: RegExp, 
  fieldName: string,
  errorMessage?: string
): void {
  if (!pattern.test(value)) {
    throw new Error(errorMessage || `${fieldName} has an invalid format`);
  }
}

/**
 * Validates an email address
 * @param email - Email address to validate
 * @throws Error if validation fails
 */
export function validateEmail(email: string): void {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  validatePattern(email, emailPattern, 'Email', 'Please enter a valid email address');
}

/**
 * Validates a URL
 * @param url - URL to validate
 * @throws Error if validation fails
 */
export function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new Error('Please enter a valid URL');
  }
}

/**
 * Validates a latitude value
 * @param lat - Latitude to validate
 * @throws Error if validation fails
 */
export function validateLatitude(lat: number): void {
  validateRange(lat, -90, 90, 'Latitude');
}

/**
 * Validates a longitude value
 * @param lon - Longitude to validate
 * @throws Error if validation fails
 */
export function validateLongitude(lon: number): void {
  validateRange(lon, -180, 180, 'Longitude');
}

/**
 * Validates a date is in the future
 * @param date - Date to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export function validateFutureDate(date: Date, fieldName: string): void {
  if (date.getTime() <= Date.now()) {
    throw new Error(`${fieldName} must be in the future`);
  }
}

/**
 * Validates a file size
 * @param fileSize - File size in bytes
 * @param maxSize - Maximum size in bytes
 * @throws Error if validation fails
 */
export function validateFileSize(fileSize: number, maxSize: number): void {
  if (fileSize > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(`File is too large. Maximum size is ${maxSizeMB}MB`);
  }
}

/**
 * Validates a file type
 * @param fileType - File MIME type
 * @param allowedTypes - Array of allowed MIME types
 * @throws Error if validation fails
 */
export function validateFileType(fileType: string, allowedTypes: string[]): void {
  const isValidType = allowedTypes.some(type => {
    // Handle wildcards like 'application/*'
    if (type.endsWith('/*')) {
      const prefix = type.split('/*')[0];
      return fileType.startsWith(prefix);
    }
    return fileType === type;
  });

  if (!isValidType) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
}

/**
 * Validates a GPX file extension
 * @param fileName - File name
 * @throws Error if validation fails
 */
export function validateGpxExtension(fileName: string): void {
  if (!fileName.toLowerCase().endsWith('.gpx')) {
    throw new Error('File must have a .gpx extension');
  }
}
