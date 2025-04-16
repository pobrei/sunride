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
 * Format a distance in meters into a readable string in kilometers
 * @param distance - Distance in meters
 * @returns Formatted distance string in kilometers (e.g., "1.2 km")
 */
export function formatDistance(distance: number): string {
  // Always display distance in kilometers as requested
  return `${(distance / 1000).toFixed(1)} km`;
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

/**
 * Theme color system for consistent color usage across the application
 * These colors are defined in CSS variables and can be used with Tailwind
 */
type ThemeColorKeys = 'bg' | 'text' | 'accent' | 'card' | 'shadow';

interface ThemeColorClasses {
  // Background classes
  bg: string;
  bgCard: string;
  bgAccent: string;

  // Text classes
  text: string;
  textAccent: string;

  // Border classes
  border: string;
  borderAccent: string;

  // Shadow
  shadow: string;

  // Common combinations
  card: string;
  button: string;
  input: string;
}

interface ThemeColors {
  // Base colors
  bg: string;
  text: string;
  accent: string;
  card: string;
  shadow: string;

  // Tailwind class mappings
  classes: ThemeColorClasses;

  // Helper function to get CSS variable value
  get: (colorName: ThemeColorKeys) => string;
}

export const themeColors: ThemeColors = {
  // Base colors
  bg: 'var(--color-bg)',
  text: 'var(--color-text)',
  accent: 'var(--color-accent)',
  card: 'var(--color-card)',
  shadow: 'var(--color-shadow)',

  // Tailwind class mappings
  classes: {
    // Background classes
    bg: 'bg-[var(--color-bg)]',
    bgCard: 'bg-[var(--color-card)]',
    bgAccent: 'bg-[var(--color-accent)]',

    // Text classes
    text: 'text-[var(--color-text)]',
    textAccent: 'text-[var(--color-accent)]',

    // Border classes
    border: 'border-[var(--color-text)]',
    borderAccent: 'border-[var(--color-accent)]',

    // Shadow
    shadow: 'shadow-[var(--color-shadow)]',

    // Common combinations
    card: 'bg-[var(--color-card)] text-[var(--color-text)] shadow-[var(--color-shadow)]',
    button: 'bg-[var(--color-accent)] text-[var(--color-card)] hover:opacity-90',
    input:
      'bg-[var(--color-card)] text-[var(--color-text)] border-[var(--color-text)/20] focus:border-[var(--color-accent)]',
  },

  // Helper function to get CSS variable value
  get: (colorName: ThemeColorKeys) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(
      `--color-${String(colorName)}`
    );
  },
};

/**
 * Convert a hex color to RGB values
 * @param hex - Hex color code (e.g., "#FF5500" or "#F50")
 * @returns RGB object {r, g, b} or null if invalid
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Validate hex format
  if (hex.length !== 6) {
    console.warn('Invalid hex color format:', hex);
    return null;
  }

  // Parse hex values
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return { r, g, b };
}

/**
 * Convert RGB values to a hex color string
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Hex color string (e.g., "#FF5500")
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}
