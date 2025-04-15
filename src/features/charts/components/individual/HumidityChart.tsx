'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/features/ui';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { formatTime, formatDistance } from '@/utils/formatUtils';

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

    const humidityData = validWeatherData.map(data => data.humidity);

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Humidity (%)',
            data: humidityData,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: context => {
              const index = context.dataIndex;
              return index === selectedMarker ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 192, 1)';
            },
            pointBorderColor: context => {
              const index = context.dataIndex;
              return index === selectedMarker ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 192, 1)';
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
                return `Humidity: ${value}%`;
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
              text: 'Humidity (%)',
            },
            min: 0,
            max: 100,
            ticks: {
              stepSize: 10,
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
        <CardTitle className="text-lg font-semibold">Humidity</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="h-[250px] w-full"
          aria-label={`Humidity chart showing values from ${Math.min(...weatherData.filter(Boolean).map(w => w?.humidity || 0))}% to ${Math.max(...weatherData.filter(Boolean).map(w => w?.humidity || 0))}%`}
        >
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default HumidityChart;
