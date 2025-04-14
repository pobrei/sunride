'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatters';

interface TemperatureChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({
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

      console.log(`Temperature chart clicked at index: ${index}`);
      onChartClick(index);
    }
  };

  // Get color scheme based on dark/light mode
  const getColorScheme = () => {
    // Check if we're in dark mode
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    return isDarkMode
      ? {
          temperature: {
            bg: 'rgba(130, 50, 70, 0.3)',
            border: 'rgb(180, 70, 90)',
            point: 'rgb(180, 70, 90)'
          },
          feelsLike: {
            bg: 'rgba(60, 130, 80, 0.3)',
            border: 'rgb(80, 170, 100)',
            point: 'rgb(80, 170, 100)'
          }
        }
      : {
          temperature: {
            bg: 'rgba(255, 232, 238, 0.3)',
            border: 'rgb(255, 182, 193)',
            point: 'rgb(255, 182, 193)'
          },
          feelsLike: {
            bg: 'rgba(220, 255, 220, 0.3)',
            border: 'rgb(152, 251, 152)',
            point: 'rgb(152, 251, 152)'
          }
        };
  };

  // Define custom tooltip styling
  const getTooltipOptions = () => {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

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
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      bodyFont: {
        size: 12,
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      caretSize: 8,
      displayColors: true
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
      drawTicks: true
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
    const labels = forecastPoints.map((point) => {
      return `${formatTime(point.timestamp)}\n${formatDistance(point.distance)}`;
    });

    const tempData = forecastPoints.map((_, i) => weatherData[i]?.temperature ?? 0);
    const feelsLikeData = forecastPoints.map((_, i) => weatherData[i]?.feelsLike ?? 0);

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
                label: 'Temperature (°C)',
                data: tempData,
                borderColor: colors.temperature.border,
                backgroundColor: colors.temperature.bg,
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'blue' : colors.temperature.point;
                },
                pointBorderColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'white' : colors.temperature.border;
                },
                pointRadius: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 8 : 4;
                },
                pointHoverRadius: 10,
                fill: true,
              },
              {
                label: 'Feels Like (°C)',
                data: feelsLikeData,
                borderColor: colors.feelsLike.border,
                borderDash: [5, 5],
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: colors.feelsLike.point,
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
                    size: 12
                  }
                }
              },
              tooltip: getTooltipOptions()
            },
            scales: {
              x: {
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)',
                  drawOnChartArea: true
                },
                ticks: {
                  color: 'hsl(var(--foreground))'
                }
              },
              y: {
                grid: getDashedGridLines(),
                min: Math.min(...tempData) - 5,
                max: Math.max(...tempData) + 5,
                title: {
                  display: true,
                  text: 'Temperature (°C)'
                }
              }
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
        <CardTitle className="text-lg">Temperature</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="h-[250px] w-full"
          role="img"
          aria-label="Temperature chart showing weather data along the route"
        >
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(TemperatureChart);
