/**
 * Chart theme configuration for light and dark modes
 */
export const chartTheme = {
  light: {
    background: '#F6F8FA',
    text: '#1E2A38',
    grid: '#E3E6EA',
    primary: '#00C2A8',
    shadow: 'rgba(0,0,0,0.05)',
    card: '#FFFFFF',
    // Chart-specific colors
    temperature: '#FF6B6B',  // Warm red for temperature
    feelsLike: '#8884d8',    // Purple for feels like
    precipitation: '#4682B4', // Steel blue for precipitation
    probability: '#9370DB',   // Medium purple for probability
    wind: '#6495ED',         // Cornflower blue for wind
    humidity: '#87CEFA',     // Light sky blue for humidity
    pressure: '#20B2AA',     // Light sea green for pressure
    uvIndex: '#FFA500',      // Orange for UV index
    elevation: '#A0522D',    // Sienna for elevation
  },
  dark: {
    background: '#0E1116',
    text: '#F5F7FA',
    grid: '#2A2F35',
    primary: '#00C2A8',
    shadow: 'rgba(0,0,0,0.25)',
    card: '#1C1F24',
    // Chart-specific colors - slightly brighter for dark mode
    temperature: '#FF8080',  // Brighter red for temperature
    feelsLike: '#A594F9',    // Brighter purple for feels like
    precipitation: '#5DA9E9', // Brighter blue for precipitation
    probability: '#B19CD9',   // Brighter purple for probability
    wind: '#82B1FF',         // Brighter blue for wind
    humidity: '#A6E1FA',     // Brighter sky blue for humidity
    pressure: '#40E0D0',     // Brighter sea green for pressure
    uvIndex: '#FFB74D',      // Brighter orange for UV index
    elevation: '#CD8162',    // Brighter sienna for elevation
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
