/**
 * Utility functions for formatting data
 */

/**
 * Format a timestamp into a readable time string
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted time string (e.g., "10:30 AM")
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a date into a readable date string
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string (e.g., "Mon, Jan 1")
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a distance in meters into a readable string
 * @param distance - Distance in meters
 * @returns Formatted distance string (e.g., "1.2 km" or "500 m")
 */
export function formatDistance(distance: number): string {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)} km`;
  }
  return `${Math.round(distance)} m`;
}

/**
 * Format a temperature in Celsius
 * @param temp - Temperature in Celsius
 * @returns Formatted temperature string (e.g., "25°C")
 */
export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`;
}

/**
 * Format wind speed in km/h
 * @param speed - Wind speed in km/h
 * @returns Formatted wind speed string (e.g., "15 km/h")
 */
export function formatWindSpeed(speed: number): string {
  return `${Math.round(speed)} km/h`;
}

/**
 * Format precipitation amount in mm
 * @param amount - Precipitation amount in mm
 * @returns Formatted precipitation string (e.g., "3.2 mm")
 */
export function formatPrecipitation(amount: number): string {
  if (amount === undefined || amount === null) {
    return 'N/A mm';
  }
  return `${amount.toFixed(1)} mm`;
}

/**
 * Format humidity as a percentage
 * @param humidity - Humidity (0-100)
 * @returns Formatted humidity string (e.g., "65%")
 */
export function formatHumidity(humidity: number): string {
  return `${Math.round(humidity)}%`;
}

/**
 * Format a duration in seconds into a readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "1h 30m")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format a file size in bytes into a readable string
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB" or "500 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format a number with commas as thousands separators
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a decimal number with a specific precision
 * @param num - Number to format
 * @param precision - Number of decimal places
 * @returns Formatted decimal string (e.g., "1.23")
 */
export function formatDecimal(num: number, precision: number = 2): string {
  return num.toFixed(precision);
}
