'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { ForecastPoint, WeatherData } from '@shared/types';
import { formatTime, formatDistance } from '@shared/utils/formatters';

interface PressureChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const PressureChart: React.FC<PressureChartProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Function to handle chart click
  const handleChartClick = (event: MouseEvent) => {
    if (!chartInstance.current) return;

    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;

    const chartArea = chartInstance.current.chartArea;
    if (!chartArea) return;

    // Only handle clicks within the chart area
    if (x >= chartArea.left && x <= chartArea.right) {
      const xPercent = (x - chartArea.left) / (chartArea.right - chartArea.left);
      const index = Math.min(
        Math.max(0, Math.floor(xPercent * forecastPoints.length)),
        forecastPoints.length - 1
      );

      console.log(`Pressure chart clicked at index: ${index}`);
      onChartClick(index);
    }
  };

  // Get color scheme based on dark/light mode
  const getColorScheme = () => {
    // Check if we're in dark mode
    const isDarkMode =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    return isDarkMode
      ? {
          pressure: {
            bg: 'rgba(128, 0, 128, 0.3)',
            border: 'rgb(186, 85, 211)',
            point: 'rgb(186, 85, 211)',
          },
        }
      : {
          pressure: {
            bg: 'rgba(230, 190, 255, 0.3)',
            border: 'rgb(147, 112, 219)',
            point: 'rgb(147, 112, 219)',
          },
        };
  };

  // Define custom tooltip styling
  const getTooltipOptions = () => {
    const isDarkMode =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
      titleColor: isDarkMode ? '#111' : '#fff',
      bodyColor: isDarkMode ? '#333' : '#fff',
      borderColor: isDarkMode ? 'rgba(200, 200, 200, 0.8)' : 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 6,
      titleFont: {
        weight: 'bold' as const,
        size: 14,
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      bodyFont: {
        size: 12,
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      caretSize: 8,
      displayColors: true,
    };
  };

  // For scales that need dashed grid lines
  const getDashedGridLines = () => {
    return {
      color: 'rgba(0, 0, 0, 0.1)',
      lineWidth: 1,
      display: true,
      drawBorder: true,
      drawOnChartArea: true,
      drawTicks: true,
    };
  };

  useEffect(() => {
    // Clean up chart instance on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (forecastPoints.length === 0 || weatherData.length === 0) return;

    // Prepare data
    const labels = forecastPoints.map(point => {
      return `${formatTime(point.timestamp)}\n${formatDistance(point.distance)}`;
    });

    const pressureData = forecastPoints.map((_, i) => weatherData[i]?.pressure ?? 0);

    // Find min and max for better scale
    const validPressures = pressureData.filter(p => p > 0);
    const minPressure = validPressures.length > 0 ? Math.min(...validPressures) : 980;
    const maxPressure = validPressures.length > 0 ? Math.max(...validPressures) : 1040;

    // Create or update chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        const colors = getColorScheme();
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Pressure (hPa)',
                data: pressureData,
                borderColor: colors.pressure.border,
                backgroundColor: colors.pressure.bg,
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: context => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'blue' : colors.pressure.point;
                },
                pointBorderColor: context => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'white' : colors.pressure.border;
                },
                pointRadius: context => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 8 : 4;
                },
                pointHoverRadius: 10,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  font: {
                    family: 'Inter, sans-serif',
                    size: 12,
                  },
                },
              },
              tooltip: getTooltipOptions(),
            },
            scales: {
              x: {
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)',
                  drawOnChartArea: true,
                },
                ticks: {
                  color: 'hsl(var(--foreground))',
                },
              },
              y: {
                grid: getDashedGridLines(),
                min: Math.max(950, minPressure - 10),
                max: Math.min(1050, maxPressure + 10),
                title: {
                  display: true,
                  text: 'Pressure (hPa)',
                },
              },
            },
          },
        });

        // Add direct click handler
        chartRef.current.addEventListener('click', handleChartClick as any);
      }
    }

    // Clean up event listener
    return () => {
      if (chartRef.current) {
        chartRef.current.removeEventListener('click', handleChartClick as any);
      }
    };
  }, [forecastPoints, weatherData, selectedMarker, onChartClick]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Pressure</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="h-[250px] w-full"
          role="img"
          aria-label="Pressure chart showing weather data along the route"
        >
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(PressureChart);
