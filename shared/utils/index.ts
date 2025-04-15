/**
 * Shared utility functions
 */

// Export all utilities
export * from './classNames';

// Export error types
export * from './errors';

// Export other utilities
export * from './formatUtils';
export * from './performance';
export * from './typeGuards';
export * from './accessibility';

// Export GPX parser if it exists
try {
  // @ts-ignore - This file might not exist yet
  export { parseGPX, generateForecastPoints } from './gpxParser';
} catch (e) {
  // Ignore if the file doesn't exist
}
