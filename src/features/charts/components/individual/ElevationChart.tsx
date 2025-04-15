'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/features/ui';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { GPXData } from '@/features/gpx/types';
import { formatTime, formatDistance } from '@/utils/formatUtils';

interface ElevationChartProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const ElevationChart: React.FC<ElevationChartProps> = ({
  gpxData,
  forecastPoints,
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
    if (!chartRef.current || !forecastPoints.length || !gpxData || !gpxData.points) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare data for the chart
    const labels = forecastPoints.map((point, index) => {
      const time = formatTime(point.timestamp);
      const distance = formatDistance(point.distance);
      return `${time} (${distance})`;
    });

    // Find the closest GPX points to each forecast point
    const elevationData = forecastPoints.map(forecastPoint => {
      // Find the closest GPX point by distance
      const closestPoint = gpxData.points.reduce((closest, point) => {
        const currentDiff = Math.abs(point.distance - forecastPoint.distance);
        const closestDiff = Math.abs(closest.distance - forecastPoint.distance);
        return currentDiff < closestDiff ? point : closest;
      }, gpxData.points[0]);

      // Ensure we have a valid elevation value
      return typeof closestPoint.elevation === 'number' && !isNaN(closestPoint.elevation)
        ? closestPoint.elevation
        : gpxData.minElevation || 0;
    });

    // Calculate min and max for y-axis with some padding
    const minElevation = Math.min(...elevationData) - 10;
    const maxElevation = Math.max(...elevationData) + 10;

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Elevation (m)',
            data: elevationData,
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: context => {
              const index = context.dataIndex;
              return index === selectedMarker ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 159, 64, 1)';
            },
            pointBorderColor: context => {
              const index = context.dataIndex;
              return index === selectedMarker ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 159, 64, 1)';
            },
            pointBorderWidth: context => {
              const index = context.dataIndex;
              return index === selectedMarker ? 2 : 1;
            },
            tension: 0.3,
            fill: true,
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
                return `Elevation: ${value} m`;
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
              text: 'Elevation (m)',
            },
            min: minElevation,
            max: maxElevation,
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
  }, [gpxData, forecastPoints, selectedMarker, onChartClick]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Elevation Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="h-[250px] w-full"
          aria-label={`Elevation chart showing the route's elevation profile`}
        >
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ElevationChart;
