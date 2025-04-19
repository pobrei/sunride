import { WeatherData } from '@/features/weather/types';

/**
 * Format a distance in meters to a human-readable string in kilometers
 *
 * @param distance - Distance value in meters
 * @returns Formatted distance string in kilometers
 */
export function formatDistance(distance: number): string {
  // Convert meters to kilometers and display
  const kilometers = distance / 1000;
  return `${kilometers.toFixed(1)} km`;
}

/**
 * Format an elevation value to a human-readable string
 *
 * @param elevation - Elevation in meters
 * @returns Formatted elevation string
 */
export function formatElevation(elevation: number): string {
  return `${Math.round(elevation)} m`;
}

/**
 * Format a timestamp to a human-readable date and time
 *
 * @param timestamp - Unix timestamp (seconds) or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: number | Date): string {
  const date: Date =
    timestamp instanceof Date
      ? timestamp
      : new Date(
          typeof timestamp === 'number' && timestamp < 10000000000
            ? timestamp * 1000 // Convert seconds to milliseconds if needed
            : timestamp
        );

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a timestamp to a human-readable time only
 *
 * @param timestamp - Unix timestamp (seconds) or Date object
 * @returns Formatted time string
 */
export function formatTime(timestamp: number | Date): string {
  const date: Date =
    timestamp instanceof Date
      ? timestamp
      : new Date(
          typeof timestamp === 'number' && timestamp < 10000000000
            ? timestamp * 1000 // Convert seconds to milliseconds if needed
            : timestamp
        );

  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a duration in hours to a human-readable string
 *
 * @param hours - Duration in hours
 * @returns Formatted duration string
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }

  const wholeHours: number = Math.floor(hours);
  const minutes: number = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours} ${wholeHours === 1 ? 'hour' : 'hours'}`;
  }

  return `${wholeHours}h ${minutes}m`;
}

/**
 * Format a duration in seconds to a human-readable string
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDurationFromSeconds(seconds: number): string {
  const hours: number = Math.floor(seconds / 3600);
  const minutes: number = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Format a temperature in Celsius to a human-readable string
 *
 * @param celsius - Temperature in Celsius
 * @param precision - Number of decimal places (default: 0)
 * @returns Formatted temperature string
 */
export function formatTemperature(celsius: number, precision: number = 0): string {
  return `${celsius.toFixed(precision)}°C`;
}

/**
 * Format wind speed and direction to a human-readable string
 *
 * @param speed - Wind speed in m/s
 * @param direction - Wind direction in degrees
 * @returns Formatted wind string
 */
export function formatWind(speed: number, direction: number): string {
  const dirs: string[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const ix: number = Math.floor((direction + 22.5) / 45) % 8;
  return `${speed.toFixed(1)} m/s ${dirs[ix]}`;
}

/**
 * Format a speed in m/s to a human-readable string in km/h
 *
 * @param metersPerSecond - Speed in m/s
 * @returns Formatted speed string
 */
export function formatSpeed(metersPerSecond: number): string {
  const kmPerHour: number = metersPerSecond * 3.6;
  return `${kmPerHour.toFixed(1)} km/h`;
}

/**
 * Format precipitation amount to a human-readable string
 *
 * @param precip - Precipitation in mm
 * @returns Formatted precipitation string
 */
export function formatPrecipitation(precip: number): string {
  return precip < 0.1 ? 'None' : `${precip.toFixed(1)} mm`;
}

/**
 * Format a percentage to a human-readable string
 *
 * @param value - Percentage as a decimal (0-1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

/**
 * Format a UV index to a human-readable string with risk level
 *
 * @param uvIndex - UV index value
 * @returns Formatted UV index string with risk level
 */
export function formatUVIndex(uvIndex: number): string {
  let risk = 'Low';

  if (uvIndex >= 3 && uvIndex < 6) {
    risk = 'Moderate';
  } else if (uvIndex >= 6 && uvIndex < 8) {
    risk = 'High';
  } else if (uvIndex >= 8 && uvIndex < 11) {
    risk = 'Very High';
  } else if (uvIndex >= 11) {
    risk = 'Extreme';
  }

  return `${uvIndex.toFixed(1)} (${risk})`;
}

/**
 * Get UV risk level information based on UV index - Flat Design (monochrome)
 *
 * @param uvIndex - UV index value
 * @returns Object with risk level and color
 */
export function getUVRiskLevel(uvIndex: number): { level: string; color: string } {
  if (uvIndex < 3) {
    return { level: 'Low', color: 'rgba(204, 204, 204, 1)' }; // Light gray
  } else if (uvIndex < 6) {
    return { level: 'Moderate', color: 'rgba(153, 153, 153, 1)' }; // Medium gray
  } else if (uvIndex < 8) {
    return { level: 'High', color: 'rgba(102, 102, 102, 1)' }; // Dark gray
  } else if (uvIndex < 11) {
    return { level: 'Very High', color: 'rgba(51, 51, 51, 1)' }; // Very dark gray
  } else {
    return { level: 'Extreme', color: 'rgba(0, 0, 0, 1)' }; // Black
  }
}

/**
 * Check if weather conditions are potentially dangerous
 *
 * @param weather - Weather data object
 * @returns Object with alert flags
 */
export function checkWeatherAlerts(weather: WeatherData): {
  highWind: boolean;
  extremeHeat: boolean;
  freezing: boolean;
  heavyRain: boolean;
} {
  return {
    highWind: weather.windSpeed > 10,
    extremeHeat: weather.temperature > 35,
    freezing: weather.temperature < 0,
    heavyRain: weather.rain > 5,
  };
}

/**
 * Get the URL for a weather icon
 *
 * @param iconCode - OpenWeather icon code
 * @returns URL to the weather icon
 */
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Get the appropriate marker color based on weather conditions - Flat Design (monochrome)
 *
 * @param weather - Weather data object or null
 * @returns Hex color code for the marker
 */
export function getMarkerColor(weather: WeatherData | null): string {
  // In flat design, we use a monochrome palette
  if (!weather) return '#CCCCCC'; // Light gray for no data

  const alerts: ReturnType<typeof checkWeatherAlerts> = checkWeatherAlerts(weather);

  if (alerts.extremeHeat) return '#000000'; // Black for extreme heat
  if (alerts.freezing) return '#333333'; // Dark gray for freezing
  if (alerts.highWind) return '#666666'; // Medium gray for high wind
  if (alerts.heavyRain) return '#999999'; // Gray for heavy rain

  // Default - normal conditions
  return '#000000'; // Black
}

/**
 * Create a solid color for temperature charts - Flat Design (no gradients)
 *
 * @param ctx - Canvas context
 * @param minTemp - Minimum temperature
 * @param maxTemp - Maximum temperature
 * @returns Solid color
 */
export function createTemperatureGradient(
  ctx: CanvasRenderingContext2D,
  minTemp: number,
  maxTemp: number
): string {
  // In flat design, we don't use gradients, just return a solid color
  return '#000000'; // Black for light mode (would be white in dark mode)
}
