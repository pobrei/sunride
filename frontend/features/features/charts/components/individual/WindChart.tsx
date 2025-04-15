'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui';
import { cn } from '@frontend/features/ui';
import { ForecastPoint, WeatherData } from '@frontend/features/weather/types';
import { formatTime, formatDistance } from '@shared/utils/formatUtils';

interface WindChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const WindChart: React.FC<WindChartProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Direct click handler for chart
  const handleChartClick = (event: MouseEvent, chart: Chart) => {
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const x = event.clientX - rect.left;

    const chartArea = chart.chartArea;
    if (!chartArea) return;

    // Only handle clicks within the chart area
    if (x >= chartArea.left && x <= chartArea.right) {
      const xPercent = (x - chartArea.left) / (chartArea.right - chartArea.left);
      if (!forecastPoints || forecastPoints.length === 0) return;

      const index = Math.min(
        Math.max(0, Math.floor(xPercent * forecastPoints.length)),
        forecastPoints.length - 1
      );

      console.log(`Wind chart clicked at index: ${index}`);
      onChartClick(index);
    }
  };

  useEffect(() => {
    return () => {
      chartInstance.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!forecastPoints || forecastPoints.length === 0 || !weatherData || weatherData.length === 0)
      return;

    // Prepare data
    const validWeatherData = weatherData.filter(data => data !== null) as WeatherData[];
    if (validWeatherData.length === 0) return;

    const labels = forecastPoints.map((point, i) => {
      if (!point || typeof point.timestamp !== 'number' || typeof point.distance !== 'number') {
        return 'N/A';
      }
      return `${formatTime(point.timestamp)}\n${formatDistance(point.distance)}`;
    });

    const windSpeedData = forecastPoints.map((_, i) => weatherData[i]?.windSpeed ?? 0);

    // Function to get the appropriate color scheme based on color mode
    const getColorScheme = () => {
      // Check if we're in dark mode - safely check for window object
      const isDarkMode =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;

      return isDarkMode
        ? {
            wind: {
              bg: 'rgba(70, 130, 160, 0.3)',
              border: 'rgb(100, 160, 190)',
              point: 'rgb(100, 160, 190)',
            },
          }
        : {
            wind: {
              bg: 'rgba(220, 240, 247, 0.3)',
              border: 'rgb(173, 216, 230)',
              point: 'rgb(173, 216, 230)',
            },
          };
    };

    // Define custom tooltip styling for charts
    const getTooltipOptions = () => {
      // Check if we're in dark mode - safely check for window object
      const isDarkMode =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;

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

    // For scales that need dashed grid lines, create a custom grid line function
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

    // Wind chart
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
                label: 'Wind Speed (m/s)',
                data: windSpeedData,
                borderColor: colors.wind.border,
                backgroundColor: colors.wind.bg,
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: context => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'blue' : colors.wind.point;
                },
                pointBorderColor: context => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'white' : colors.wind.border;
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
                min: Math.min(...windSpeedData) - 5,
                max: Math.max(...windSpeedData) + 5,
                title: {
                  display: true,
                  text: 'Wind Speed (m/s)',
                },
              },
            },
            onClick: function (event, elements) {
              console.log('Chart clicked!', elements);
              if (elements && elements.length > 0) {
                const clickedIndex = elements[0].index;
                console.log('Clicked chart point at index:', clickedIndex);
                onChartClick(clickedIndex);
              }
            },
          },
        });

        // Add direct click handler
        chartRef.current.addEventListener('click', event => {
          handleChartClick(event, chartInstance.current as Chart);
        });
      }
    }
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
          aria-label={`Wind chart showing wind speeds from ${Math.min(...weatherData.filter(Boolean).map(w => w?.windSpeed || 0))} to ${Math.max(...weatherData.filter(Boolean).map(w => w?.windSpeed || 0))} m/s`}
        >
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default WindChart;
