'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { ForecastPoint, WeatherData } from '@backend/lib/weatherAPI';
import { formatTime, formatDistance } from '@shared/utils/formatUtils';

/**
 * Props for the WindChart component
 */
interface WindChartProps {
  /** Array of forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Index of the currently selected marker */
  selectedMarker: number | null;
  /** Callback function when a point on the chart is clicked */
  onChartClick: (index: number) => void;
}

/**
 * Chart component for displaying wind data
 * @param props - Component props
 * @returns React component
 */
const WindChart: React.FC<WindChartProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  /**
   * Function to handle chart click events
   * @param event - Mouse event from the canvas
   */
  const handleChartClick = (event: MouseEvent): void => {
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

      console.log(`Wind chart clicked at index: ${index}`);
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
          windSpeed: {
            bg: 'rgba(144, 238, 144, 0.3)',
            border: 'rgb(144, 238, 144)',
            point: 'rgb(144, 238, 144)',
          },
          windGust: {
            bg: 'rgba(255, 165, 0, 0.3)',
            border: 'rgb(255, 165, 0)',
            point: 'rgb(255, 165, 0)',
          },
        }
      : {
          windSpeed: {
            bg: 'rgba(60, 179, 113, 0.3)',
            border: 'rgb(46, 139, 87)',
            point: 'rgb(46, 139, 87)',
          },
          windGust: {
            bg: 'rgba(255, 140, 0, 0.3)',
            border: 'rgb(255, 140, 0)',
            point: 'rgb(255, 140, 0)',
          },
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

    const windSpeedData = forecastPoints.map((_, i) => weatherData[i]?.windSpeed ?? 0);
    const windGustData = forecastPoints.map((_, i) => weatherData[i]?.windGust ?? 0);

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
                label: 'Wind Speed (km/h)',
                data: windSpeedData,
                borderColor: colors.windSpeed.border,
                backgroundColor: colors.windSpeed.bg,
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: context => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'blue' : colors.windSpeed.point;
                },
                pointBorderColor: context => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'white' : colors.windSpeed.border;
                },
                pointRadius: context => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 8 : 4;
                },
                pointHoverRadius: 10,
                fill: true,
              },
              {
                label: 'Wind Gust (km/h)',
                data: windGustData,
                borderColor: colors.windGust.border,
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: colors.windGust.point,
                pointRadius: 0,
                pointHoverRadius: 5,
                fill: false,
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
              tooltip: {
                mode: 'index',
                intersect: false,
              },
            },
            scales: {
              x: {
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                  color: 'hsl(var(--foreground))',
                },
              },
              y: {
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                },
                min: 0,
                max: Math.max(...windGustData) * 1.2 || 50,
                title: {
                  display: true,
                  text: 'Wind Speed (km/h)',
                },
              },
            },
          },
        });

        // Add direct click handler
        chartRef.current.addEventListener('click', handleChartClick as EventListener);
      }
    }

    // Clean up event listener
    return () => {
      if (chartRef.current) {
        chartRef.current.removeEventListener('click', handleChartClick as EventListener);
      }
    };
  }, [forecastPoints, weatherData, selectedMarker, onChartClick]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Wind</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="h-[250px] w-full"
          role="img"
          aria-label="Wind chart showing wind speed and gusts along the route"
        >
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(WindChart);
