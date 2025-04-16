'use client';

// Set global defaults for all charts
export function setupChartDefaults() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Dynamically import Chart.js to avoid SSR issues
  import('chart.js/auto').then((ChartModule) => {
    const Chart = ChartModule.default;

    // Set global defaults for all charts
    Chart.defaults.color = '#FFFFFF';
    Chart.defaults.font.family = 'Inter, sans-serif';

    // Set global plugin defaults
    if (Chart.defaults.plugins) {
      if (Chart.defaults.plugins.legend) {
        Chart.defaults.plugins.legend.labels.color = '#FFFFFF';
      }

      if (Chart.defaults.plugins.tooltip) {
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';
        Chart.defaults.plugins.tooltip.bodyColor = '#FFFFFF';
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.2)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
      }
    }

    // Set scale defaults if they exist
    try {
      // These might not exist depending on Chart.js version
      if (Chart.defaults.scales?.linear) {
        Chart.defaults.scales.linear.grid.color = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.scales.linear.ticks.color = '#FFFFFF';
        Chart.defaults.scales.linear.title.color = '#FFFFFF';
      }

      if (Chart.defaults.scales?.category) {
        Chart.defaults.scales.category.grid.color = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.scales.category.ticks.color = '#FFFFFF';
      }
    } catch (e) {
      console.log('Could not set all Chart.js scale defaults:', e);
    }
  }).catch(err => {
    console.error('Failed to load Chart.js:', err);
  });
}
