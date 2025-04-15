'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui';
import { cn } from '@frontend/features/ui';
import { ForecastPoint, WeatherData } from '@frontend/features/weather/types';
import { formatTime, formatDistance } from '@shared/utils/formatUtils';

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

    const pressureData = validWeatherData.map(data => data.pressure);

    // Calculate min and max for y-axis
    const minPressure = Math.min(...pressureData) - 5;
    const maxPressure = Math.max(...pressureData) + 5;

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Pressure (hPa)',
            data: pressureData,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: context => {
              const index = context.dataIndex;
              return index === selectedMarker ? 'rgba(255, 99, 132, 1)' : 'rgba(153, 102, 255, 1)';
            },
            pointBorderColor: context => {
              const index = context.dataIndex;
              return index === selectedMarker ? 'rgba(255, 99, 132, 1)' : 'rgba(153, 102, 255, 1)';
            },
            pointBorderWidth: context => {
              const index = context.dataIndex;
              return index === selectedMarker ? 2 : 1;
            },
            tension: 0.3,
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
                return `Pressure: ${value} hPa`;
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
              text: 'Pressure (hPa)',
            },
            min: minPressure,
            max: maxPressure,
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
        <CardTitle className="text-lg font-semibold">Atmospheric Pressure</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="h-[250px] w-full"
          aria-label={`Pressure chart showing values from ${Math.min(...weatherData.filter(Boolean).map(w => w?.pressure || 0))} hPa to ${Math.max(...weatherData.filter(Boolean).map(w => w?.pressure || 0))} hPa`}
        >
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PressureChart;
