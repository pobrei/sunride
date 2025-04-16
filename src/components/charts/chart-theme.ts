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
  },
  dark: {
    background: '#0E1116',
    text: '#F5F7FA',
    grid: '#2A2F35',
    primary: '#00C2A8',
    shadow: 'rgba(0,0,0,0.25)',
    card: '#1C1F24',
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
