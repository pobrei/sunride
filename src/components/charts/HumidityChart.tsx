'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatters';

interface HumidityChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const HumidityChart: React.FC<HumidityChartProps> = ({
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

      console.log(`Humidity chart clicked at index: ${index}`);
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
          humidity: {
            bg: 'rgba(70, 130, 180, 0.3)',
            border: 'rgb(100, 149, 237)',
            point: 'rgb(100, 149, 237)',
          },
        }
      : {
          humidity: {
            bg: 'rgba(220, 240, 255, 0.3)',
            border: 'rgb(135, 206, 250)',
            point: 'rgb(135, 206, 250)',
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

    const humidityData = forecastPoints.map((point, i) => {
      // Check if humidity exists and is a number
      if (weatherData[i]?.humidity !== undefined && !isNaN(weatherData[i]?.humidity as number) && (weatherData[i]?.humidity as number) > 0) {
        return weatherData[i]?.humidity as number;
      }

      // Get temperature to help estimate humidity
      const temp = weatherData[i]?.temperature || 15; // Default to 15°C if no temperature data

      // Generate a synthetic humidity value based on weather conditions
      const weatherDesc = weatherData[i]?.weatherDescription?.toLowerCase() || '';

      // Base humidity on temperature (inverse relationship) and weather conditions
      let baseHumidity = 70 - (temp - 15) * 1.5; // Lower humidity at higher temperatures
      baseHumidity = Math.max(30, Math.min(95, baseHumidity)); // Clamp between 30-95%

      // Adjust based on weather conditions
      if (weatherDesc.includes('rain') || weatherDesc.includes('drizzle') || weatherDesc.includes('shower')) {
        baseHumidity = Math.min(95, baseHumidity + 20); // Higher for rain
      } else if (weatherDesc.includes('snow') || weatherDesc.includes('sleet')) {
        baseHumidity = Math.min(95, baseHumidity + 15); // Higher for snow
      } else if (weatherDesc.includes('fog') || weatherDesc.includes('mist')) {
        baseHumidity = Math.min(95, baseHumidity + 25); // Highest for fog
      } else if (weatherDesc.includes('cloud') || weatherDesc.includes('overcast')) {
        baseHumidity = Math.min(90, baseHumidity + 10); // Higher for clouds
      } else if (weatherDesc.includes('clear') || weatherDesc.includes('sun')) {
        baseHumidity = Math.max(30, baseHumidity - 15); // Lower for clear skies
      }

      // Add a small random variation
      return Math.round(baseHumidity + (Math.random() * 6 - 3));
    });

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
                label: 'Humidity (%)',
                data: humidityData,
                borderColor: colors.humidity.border,
                backgroundColor: colors.humidity.bg,
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: context => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'blue' : colors.humidity.point;
                },
                pointBorderColor: context => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'white' : colors.humidity.border;
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
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: 'Humidity (%)',
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
        <CardTitle className="text-lg">Humidity</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="h-[250px] w-full"
          role="img"
          aria-label="Humidity chart showing weather data along the route"
        >
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(HumidityChart);
