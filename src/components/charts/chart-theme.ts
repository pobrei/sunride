/**
 * Chart theme configuration - Flat Design with improved color palette
 */
export const chartTheme = {
  light: {
    background: '#F0F5FF',
    text: '#1E293B',         // Darker text for better contrast
    grid: '#D1E0FF',         // Slightly darker grid lines for better visibility
    primary: '#1E293B',      // Darker primary color for better contrast
    shadow: 'rgba(0, 0, 0, 0.1)',
    card: '#FFFFFF',
    // Chart-specific colors with better contrast for light mode
    // Temperature group - warm colors
    temperature: '#F87171',  // Red for temperature
    feelsLike: '#FB923C',    // Orange for feels like

    // Precipitation group - blue colors
    precipitation: '#38BDF8', // Sky blue for precipitation
    probability: '#0369A1',   // Darker sky blue for probability

    // Wind group - teal/cyan colors
    wind: '#0D9488',         // Teal for wind

    // Humidity group - blue/purple colors
    humidity: '#818CF8',     // Indigo for humidity

    // Pressure group - purple colors
    pressure: '#A855F7',     // Purple for pressure

    // Elevation group - neutral colors
    elevation: '#78716C',    // Stone for elevation

    // UV Index group - colors by risk level
    uvIndex: '#FBBF24',      // Default amber for UV index
    uvLow: '#22C55E',        // Green for low UV (0-2)
    uvModerate: '#FBBF24',   // Amber for moderate UV (3-5)
    uvHigh: '#F97316',       // Orange for high UV (6-7)
    uvVeryHigh: '#EF4444',   // Red for very high UV (8-10)
    uvExtreme: '#9333EA',    // Purple for extreme UV (11+)
  },
  dark: {
    background: '#1A1A1A',
    text: '#F9F9FF',
    grid: '#333333',         // Dark gray grid lines
    primary: '#FFFFFF',
    shadow: 'transparent',
    card: '#1A1A1A',
    // Chart-specific colors with better contrast for dark mode
    // Temperature group - warm colors
    temperature: '#FCA5A5',  // Lighter red for temperature
    feelsLike: '#FDBA74',    // Lighter orange for feels like

    // Precipitation group - blue colors
    precipitation: '#7DD3FC', // Lighter sky blue for precipitation
    probability: '#38BDF8',   // Sky blue for probability

    // Wind group - teal/cyan colors
    wind: '#2DD4BF',         // Lighter teal for wind

    // Humidity group - blue/purple colors
    humidity: '#A5B4FC',     // Lighter indigo for humidity

    // Pressure group - purple colors
    pressure: '#C084FC',     // Lighter purple for pressure

    // Elevation group - neutral colors
    elevation: '#A8A29E',    // Lighter stone for elevation

    // UV Index group - colors by risk level (lighter for dark mode)
    uvIndex: '#FCD34D',      // Default lighter amber for UV index
    uvLow: '#4ADE80',        // Lighter green for low UV (0-2)
    uvModerate: '#FCD34D',   // Lighter amber for moderate UV (3-5)
    uvHigh: '#FB923C',       // Lighter orange for high UV (6-7)
    uvVeryHigh: '#FCA5A5',   // Lighter red for very high UV (8-10)
    uvExtreme: '#C084FC',    // Lighter purple for extreme UV (11+)
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
 * Create a solid color for chart fills - Flat Design (no gradients)
 */
export const createGradient = (ctx: CanvasRenderingContext2D, isDark: boolean) => {
  // In flat design, we don't use gradients, just return a solid color with very low opacity
  const theme = isDark ? chartTheme.dark : chartTheme.light;
  return theme.primary;
};
