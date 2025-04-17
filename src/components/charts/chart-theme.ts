/**
 * Chart theme configuration for light and dark modes
 */
export const chartTheme = {
  light: {
    background: '#F6F8FA',
    text: '#1E2A38',
    grid: '#CBD5E1',         // Darker grid lines for better visibility
    primary: '#00C2A8',
    shadow: 'rgba(0,0,0,0.05)',
    card: '#FFFFFF',
    // Chart-specific colors
    temperature: '#E53E3E',  // Darker red for temperature
    feelsLike: '#6D28D9',    // Darker purple for feels like
    precipitation: '#2563EB', // Darker blue for precipitation
    probability: '#7C3AED',   // Darker purple for probability
    wind: '#3B82F6',         // Darker blue for wind
    humidity: '#0EA5E9',     // Darker sky blue for humidity
    pressure: '#059669',     // Darker sea green for pressure
    uvIndex: '#D97706',      // Darker orange for UV index
    elevation: '#9A3412',    // Darker sienna for elevation
  },
  dark: {
    background: '#0E1116',
    text: '#F5F7FA',
    grid: '#4B5563',         // Lighter grid lines for better visibility
    primary: '#00C2A8',
    shadow: 'rgba(0,0,0,0.25)',
    card: '#1C1F24',
    // Chart-specific colors - brighter and more saturated for dark mode
    temperature: '#F87171',  // Brighter red for temperature
    feelsLike: '#C4B5FD',    // Brighter purple for feels like
    precipitation: '#60A5FA', // Brighter blue for precipitation
    probability: '#DDD6FE',   // Brighter purple for probability
    wind: '#93C5FD',         // Brighter blue for wind
    humidity: '#7DD3FC',     // Brighter sky blue for humidity
    pressure: '#6EE7B7',     // Brighter sea green for pressure
    uvIndex: '#FBBF24',      // Brighter orange for UV index
    elevation: '#FDBA74',    // Brighter sienna for elevation
  }
};

/**
 * Get the current theme based on system preference
 * In a real app, this would also check user preference
 */
export const getCurrentTheme = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? chartTheme.dark
      : chartTheme.light;
  }
  return chartTheme.light; // Default to light theme on server
};

/**
 * Create a gradient for chart fills
 */
export const createGradient = (ctx: CanvasRenderingContext2D, isDark: boolean) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  const theme = isDark ? chartTheme.dark : chartTheme.light;

  gradient.addColorStop(0, `${theme.primary}50`); // 50% opacity
  gradient.addColorStop(1, `${theme.primary}00`); // 0% opacity

  return gradient;
};
