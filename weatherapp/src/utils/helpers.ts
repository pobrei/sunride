/**
 * Common utility functions for formatting and data processing
 */
import { WeatherData } from '@/types';

/**
 * Format a distance in kilometers to a human-readable string
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (typeof distance !== 'number' || isNaN(distance)) {
    return 'N/A';
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1)} km`;
}

/**
 * Format elevation in meters to a human-readable string
 * @param elevation Elevation in meters
 * @returns Formatted elevation string
 */
export function formatElevation(elevation: number): string {
  if (typeof elevation !== 'number' || isNaN(elevation)) {
    return 'N/A';
  }

  return `${Math.round(elevation)} m`;
}

/**
 * Format a timestamp to a human-readable date and time string
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: number): string {
  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    return 'N/A';
  }

  const date = new Date(timestamp * 1000);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

/**
 * Format a timestamp to a human-readable time string
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted time string
 */
export function formatTime(timestamp: number): string {
  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    return 'N/A';
  }

  const date = new Date(timestamp * 1000);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Time';
  }

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a temperature in Celsius to a human-readable string
 * @param temp Temperature in Celsius
 * @returns Formatted temperature string
 */
export function formatTemperature(temp: number): string {
  if (typeof temp !== 'number' || isNaN(temp)) {
    return 'N/A';
  }

  return `${Math.round(temp)}°C`;
}

/**
 * Format wind speed and direction to a human-readable string
 * @param speed Wind speed in m/s
 * @param direction Wind direction in degrees
 * @returns Formatted wind string
 */
export function formatWind(speed: number, direction: number): string {
  if (typeof speed !== 'number' || isNaN(speed) ||
      typeof direction !== 'number' || isNaN(direction)) {
    return 'N/A';
  }

  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const ix = Math.floor((direction + 22.5) / 45) % 8;
  return `${speed.toFixed(1)} m/s ${dirs[ix]}`;
}

/**
 * Format precipitation amount to a human-readable string
 * @param precip Precipitation amount in mm
 * @returns Formatted precipitation string
 */
export function formatPrecipitation(precip: number): string {
  if (typeof precip !== 'number' || isNaN(precip)) {
    return 'N/A';
  }

  return precip < 0.1 ? 'None' : `${precip.toFixed(1)} mm`;
}

/**
 * Check if weather conditions are potentially dangerous
 * @param weather Weather data
 * @returns Object with boolean flags for different weather alerts
 */
export function checkWeatherAlerts(weather: WeatherData): {
  highWind: boolean;
  extremeHeat: boolean;
  freezing: boolean;
  heavyRain: boolean;
} {
  if (!weather) {
    return {
      highWind: false,
      extremeHeat: false,
      freezing: false,
      heavyRain: false
    };
  }

  return {
    highWind: typeof weather.windSpeed === 'number' && weather.windSpeed > 10,
    extremeHeat: typeof weather.temperature === 'number' && weather.temperature > 35,
    freezing: typeof weather.temperature === 'number' && weather.temperature < 0,
    heavyRain: typeof weather.rain === 'number' && weather.rain > 5
  };
}

/**
 * Get the URL for a weather icon
 * @param iconCode OpenWeatherMap icon code
 * @returns URL to the weather icon
 */
export function getWeatherIconUrl(iconCode: string): string {
  if (!iconCode || typeof iconCode !== 'string') {
    return 'https://openweathermap.org/img/wn/01d@2x.png'; // Default to clear sky
  }

  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Get a color for a weather marker based on conditions
 * @param weather Weather data
 * @returns Color in hex format
 */
export function getMarkerColor(weather: WeatherData | null): string {
  if (!weather) return '#9ca3af'; // Gray for unknown

  const alerts = checkWeatherAlerts(weather);

  if (alerts.extremeHeat) return '#FF5722'; // Red-orange for extreme heat
  if (alerts.freezing) return '#2196F3';    // Blue for freezing
  if (alerts.highWind) return '#FFC107';    // Amber for high wind
  if (alerts.heavyRain) return '#673AB7';   // Deep purple for heavy rain

  // Default - normal conditions
  return '#4CAF50'; // Green
}

/**
 * Create a temperature gradient for charts
 * @param ctx Canvas rendering context
 * @param minTemp Minimum temperature in the dataset
 * @param maxTemp Maximum temperature in the dataset
 * @returns Canvas gradient object
 */
export function createTemperatureGradient(
  ctx: CanvasRenderingContext2D,
  minTemp: number,
  maxTemp: number
): CanvasGradient {
  if (!ctx) {
    throw new Error('Canvas context is required');
  }

  if (typeof minTemp !== 'number' || typeof maxTemp !== 'number') {
    minTemp = 0;
    maxTemp = 25; // Default to a pleasant range
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 300);

  if (minTemp < 0 && maxTemp > 30) {
    // Wide range: cold to hot
    gradient.addColorStop(0, 'rgba(255, 87, 34, 0.8)');  // Hot (red-orange)
    gradient.addColorStop(0.4, 'rgba(76, 175, 80, 0.5)'); // Pleasant (green)
    gradient.addColorStop(1, 'rgba(33, 150, 243, 0.8)');  // Cold (blue)
  } else if (minTemp < 0) {
    // Cold range
    gradient.addColorStop(0, 'rgba(33, 150, 243, 0.5)');
    gradient.addColorStop(1, 'rgba(33, 150, 243, 0.8)');
  } else if (maxTemp > 30) {
    // Hot range
    gradient.addColorStop(0, 'rgba(255, 87, 34, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 152, 0, 0.5)');
  } else {
    // Pleasant range
    gradient.addColorStop(0, 'rgba(76, 175, 80, 0.5)');
    gradient.addColorStop(1, 'rgba(76, 175, 80, 0.8)');
  }

  return gradient;
}

/**
 * Truncate a string to a maximum length and add ellipsis if needed
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  if (str.length <= maxLength) {
    return str;
  }

  return str.substring(0, maxLength) + '...';
}

/**
 * Generate a random ID
 * @returns Random ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce a function
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}