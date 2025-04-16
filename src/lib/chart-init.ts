'use client';

// Track initialization status
let isInitialized = false;

// Initialize Chart.js with proper defaults for visibility
export function initializeChartDefaults() {
  // Only run in browser and only once
  if (typeof window === 'undefined' || isInitialized) return;

  // Set initialization flag
  isInitialized = true;

  try {
    // Dynamically import Chart.js to avoid SSR issues
    import('chart.js/auto').then((ChartModule) => {
      const Chart = ChartModule.default;

      // Get theme colors from CSS variables
      const getThemeColor = (varName: string, fallback: string) => {
        if (typeof window !== 'undefined' && window.document) {
          const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
          return value || fallback;
        }
        return fallback;
      };

      // Get theme-aware colors
      const textColor = getThemeColor('--foreground', '#1E2A38');
      const mutedColor = getThemeColor('--muted-foreground', '#64748B');
      const borderColor = getThemeColor('--border', '#E2E8F0');
      const backgroundColor = getThemeColor('--card', '#FFFFFF');
      const gridColor = getThemeColor('--border', '#E2E8F0');

      // Set global defaults
      Chart.defaults.color = textColor;
      Chart.defaults.font.family = 'Inter, sans-serif';
      Chart.defaults.font.size = 12;
      Chart.defaults.backgroundColor = 'transparent';
      Chart.defaults.borderColor = borderColor;

      // Force transparent background for all charts
      if (Chart.defaults.datasets) {
        if (Chart.defaults.datasets.bar) {
          Chart.defaults.datasets.bar.backgroundColor = 'transparent';
        }
        if (Chart.defaults.datasets.line) {
          Chart.defaults.datasets.line.backgroundColor = 'transparent';
        }
      }

      // Ensure charts have transparent backgrounds
      if (Chart.defaults.elements) {
        if (Chart.defaults.elements.line) {
          Chart.defaults.elements.line.borderWidth = 2;
        }
        if (Chart.defaults.elements.point) {
          Chart.defaults.elements.point.radius = 3;
          Chart.defaults.elements.point.hoverRadius = 5;
        }
        if (Chart.defaults.elements.bar) {
          Chart.defaults.elements.bar.borderWidth = 1;
          Chart.defaults.elements.bar.borderRadius = 4;
        }
      }

      // Set global plugin defaults
      if (Chart.defaults.plugins) {
        // Configure legend
        if (Chart.defaults.plugins.legend) {
          Chart.defaults.plugins.legend.labels = {
            color: textColor,
            font: {
              family: 'Inter, sans-serif',
              size: 12
            }
          };
        }
      }

      // Set global scale defaults for all scale types
      const scaleDefaults = {
        grid: {
          color: gridColor,
          borderColor: gridColor,
          tickColor: gridColor
        },
        ticks: {
          color: mutedColor
        }
      };

      // Apply scale defaults safely
      if (Chart.defaults.scales) {
        // For linear scales
        if (Chart.defaults.scales.linear) {
          Object.assign(Chart.defaults.scales.linear, scaleDefaults);
        }

        // For category scales
        if (Chart.defaults.scales.category) {
          Object.assign(Chart.defaults.scales.category, scaleDefaults);
        }

        // For x and y scales
        if (Chart.defaults.scales.x) {
          Object.assign(Chart.defaults.scales.x, scaleDefaults);
        }
        if (Chart.defaults.scales.y) {
          Object.assign(Chart.defaults.scales.y, scaleDefaults);
        }
      }

      // Set chart area background to transparent
      if (Chart.defaults.plugins && Chart.defaults.plugins.tooltip) {
        Chart.defaults.plugins.tooltip.backgroundColor = backgroundColor;
        Chart.defaults.plugins.tooltip.titleColor = textColor;
        Chart.defaults.plugins.tooltip.bodyColor = textColor;
        Chart.defaults.plugins.tooltip.borderColor = borderColor;
        Chart.defaults.plugins.tooltip.borderWidth = 1;
      }

      // Log that initialization is complete
      console.log('Chart.js defaults initialized successfully with transparent background');
    }).catch(err => {
      console.error('Failed to load Chart.js:', err);
    });
  } catch (error) {
    console.error('Error initializing Chart.js defaults:', error);
  }
}
