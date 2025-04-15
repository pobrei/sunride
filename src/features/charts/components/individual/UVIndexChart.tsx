'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/features/ui';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { formatTime, formatDistance } from '@/utils/formatUtils';

interface UVIndexChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const UVIndexChart: React.FC<UVIndexChartProps> = ({
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
    const xAxis = chart.scales.x;

    // Check if click is within chart area
    if (x >= chartArea.left && x <= chartArea.right) {
      // Calculate which data point was clicked
      const index = Math.round(
        (x - chartArea.left) / ((chartArea.right - chartArea.left) / (forecastPoints.length - 1))
      );

      if (index >= 0 && index < forecastPoints.length) {
        onChartClick(index);
      }
    }
  };

  // Helper function to get UV index risk level and color
  const getUVRiskLevel = (uvIndex: number): { level: string; color: string } => {
    if (uvIndex <= 2) {
      return { level: 'Low', color: 'rgba(76, 175, 80, 1)' }; // Green
    } else if (uvIndex <= 5) {
      return { level: 'Moderate', color: 'rgba(255, 235, 59, 1)' }; // Yellow
    } else if (uvIndex <= 7) {
      return { level: 'High', color: 'rgba(255, 152, 0, 1)' }; // Orange
    } else if (uvIndex <= 10) {
      return { level: 'Very High', color: 'rgba(244, 67, 54, 1)' }; // Red
    } else {
      return { level: 'Extreme', color: 'rgba(156, 39, 176, 1)' }; // Purple
    }
  };

  useEffect(() => {
    if (!chartRef.current || !weatherData.length || !forecastPoints.length) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Filter out null values
    const validWeatherData = weatherData.filter((data): data is WeatherData => data !== null);

    if (validWeatherData.length === 0) return;

    // Prepare data for the chart
    const labels = forecastPoints.map((point, index) => {
      const time = formatTime(point.timestamp);
      const distance = formatDistance(point.distance);
      return `${time} (${distance})`;
    });

    const uvIndexData = validWeatherData.map(data => data.uvIndex || 0);

    // Create background gradient based on UV index levels
    const backgroundColors = uvIndexData.map(uvIndex => {
      const { color } = getUVRiskLevel(uvIndex);
      return color.replace('1)', '0.2)');
    });

    const borderColors = uvIndexData.map(uvIndex => {
      const { color } = getUVRiskLevel(uvIndex);
      return color;
    });

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'UV Index',
            data: uvIndexData,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: tooltipItems => {
                const index = tooltipItems[0].dataIndex;
                const time = formatTime(forecastPoints[index].timestamp);
                const distance = formatDistance(forecastPoints[index].distance);
                return `${time} (${distance})`;
              },
              label: context => {
                const value = context.raw as number;
                const { level } = getUVRiskLevel(value);
                return [`UV Index: ${value}`, `Risk Level: ${level}`];
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time (Distance)',
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'UV Index',
            },
            min: 0,
            max: 12,
            ticks: {
              stepSize: 1,
              callback: function (value) {
                if (value <= 2) return `${value} (Low)`;
                if (value <= 5) return `${value} (Moderate)`;
                if (value <= 7) return `${value} (High)`;
                if (value <= 10) return `${value} (Very High)`;
                return `${value} (Extreme)`;
              },
            },
          },
        },
        onClick: (event, elements, chart) => {
          handleChartClick(event as unknown as MouseEvent, chart);
        },
      },
    });

    // Add click event listener to the canvas
    const canvas = chartRef.current;
    canvas.addEventListener('click', event => {
      if (chartInstance.current) {
        handleChartClick(event, chartInstance.current);
      }
    });

    // Cleanup function
    return () => {
      canvas.removeEventListener('click', event => {
        if (chartInstance.current) {
          handleChartClick(event, chartInstance.current);
        }
      });
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [forecastPoints, weatherData, selectedMarker, onChartClick]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">UV Index</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="h-[250px] w-full"
          aria-label={`UV Index chart showing values from 0 to ${Math.max(...weatherData.filter(Boolean).map(w => w?.uvIndex || 0))}`}
        >
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default UVIndexChart;
