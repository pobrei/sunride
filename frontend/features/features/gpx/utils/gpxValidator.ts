/**
 * Utility functions for validating GPX files
 */

/**
 * Validates a GPX file before parsing
 * @param file - The file to validate
 * @throws Error if the file is invalid
 */
export function validateGPXFile(file: File): void {
  // Check if file exists
  if (!file) {
    throw new Error('No file provided');
  }

  // Check file extension
  const validExtensions = ['.gpx'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (!validExtensions.includes(fileExtension)) {
    throw new Error(`Invalid file type. Expected .gpx but received ${fileExtension}`);
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File is too large (${sizeMB}MB). Maximum size is 10MB`);
  }

  // Check if file is empty
  if (file.size === 0) {
    throw new Error('File is empty');
  }
}

/**
 * Validates GPX content before parsing
 * @param content - The GPX file content as string
 * @throws Error if the content is invalid
 */
export function validateGPXContent(content: string): void {
  // Check if content exists
  if (!content) {
    throw new Error('Empty GPX content');
  }

  // Check if content is too short to be valid
  if (content.length < 100) {
    throw new Error('GPX content is too short to be valid');
  }

  // Check for GPX XML structure
  if (!content.includes('<gpx')) {
    throw new Error('Missing <gpx> tag. Not a valid GPX file');
  }

  if (!content.includes('</gpx>')) {
    throw new Error('Missing closing </gpx> tag. GPX file may be corrupted');
  }

  // Check for track or route points
  const hasTrackPoints = content.includes('<trkpt');
  const hasRoutePoints = content.includes('<rtept');

  if (!hasTrackPoints && !hasRoutePoints) {
    throw new Error('No track or route points found in GPX file');
  }

  // Check for XML declaration
  if (content.includes('<?xml') && !content.includes('<?xml version=')) {
    throw new Error('Malformed XML declaration in GPX file');
  }
}

/**
 * Checks if a GPX file has valid coordinates
 * @param content - The GPX file content as string
 * @returns True if the file has valid coordinates
 */
export function hasValidCoordinates(content: string): boolean {
  // Simple regex to check for latitude and longitude attributes
  const latRegex = /lat=["'](-?\d+(\.\d+)?)["']/;
  const lonRegex = /lon=["'](-?\d+(\.\d+)?)["']/;

  return latRegex.test(content) && lonRegex.test(content);
}

/**
 * Estimates the number of track points in a GPX file
 * @param content - The GPX file content as string
 * @returns Estimated number of track points
 */
export function estimateTrackPoints(content: string): number {
  // Count occurrences of track points
  const trkptMatches = content.match(/<trkpt/g);
  const rteptMatches = content.match(/<rtept/g);

  const trkptCount = trkptMatches ? trkptMatches.length : 0;
  const rteptCount = rteptMatches ? rteptMatches.length : 0;

  return trkptCount + rteptCount;
}

/**
 * Checks if a GPX file has elevation data
 * @param content - The GPX file content as string
 * @returns True if the file has elevation data
 */
export function hasElevationData(content: string): boolean {
  return content.includes('<ele>');
}

/**
 * Checks if a GPX file has timestamp data
 * @param content - The GPX file content as string
 * @returns True if the file has timestamp data
 */
export function hasTimestampData(content: string): boolean {
  return content.includes('<time>');
}
