'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { formatTime, formatDistance } from '@/utils/helpers';

interface PrecipitationChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const PrecipitationChart: React.FC<PrecipitationChartProps> = ({
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
      
      console.log(`Precipitation chart clicked at index: ${index}`);
      onChartClick(index);
    }
  };

  // Get color scheme based on dark/light mode
  const getColorScheme = () => {
    // Check if we're in dark mode
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return isDarkMode 
      ? {
          precipitation: {
            bg: 'rgba(65, 105, 225, 0.3)',
            border: 'rgb(65, 105, 225)',
            point: 'rgb(65, 105, 225)'
          },
          probability: {
            bg: 'rgba(100, 149, 237, 0.3)',
            border: 'rgb(100, 149, 237)',
            point: 'rgb(100, 149, 237)'
          }
        }
      : {
          precipitation: {
            bg: 'rgba(135, 206, 250, 0.3)',
            border: 'rgb(30, 144, 255)',
            point: 'rgb(30, 144, 255)'
          },
          probability: {
            bg: 'rgba(176, 224, 230, 0.3)',
            border: 'rgb(70, 130, 180)',
            point: 'rgb(70, 130, 180)'
          }
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

    const precipitationData = forecastPoints.map((_, i) => weatherData[i]?.precipitation ?? 0);
    const probabilityData = forecastPoints.map((_, i) => (weatherData[i]?.precipitationProbability ?? 0) * 100);

    // Create or update chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        const colors = getColorScheme();
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                type: 'bar',
                label: 'Precipitation (mm)',
                data: precipitationData,
                backgroundColor: colors.precipitation.bg,
                borderColor: colors.precipitation.border,
                borderWidth: 1,
                yAxisID: 'y',
                barPercentage: 0.8,
                categoryPercentage: 0.9,
                order: 2,
              },
              {
                type: 'line',
                label: 'Probability (%)',
                data: probabilityData,
                borderColor: colors.probability.border,
                backgroundColor: colors.probability.bg,
                borderWidth: 2,
                pointBackgroundColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'blue' : colors.probability.point;
                },
                pointBorderColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'white' : colors.probability.border;
                },
                pointRadius: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 8 : 4;
                },
                pointHoverRadius: 10,
                yAxisID: 'y1',
                fill: false,
                tension: 0.4,
                order: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
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
                  color: 'hsl(var(--foreground))'
                }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Precipitation (mm)',
                },
                min: 0,
                max: Math.max(...precipitationData) * 1.2 || 5,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                },
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Probability (%)',
                },
                min: 0,
                max: 100,
                grid: {
                  drawOnChartArea: false,
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
        <CardTitle className="text-lg">Precipitation</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="h-[250px] w-full" 
          role="img" 
          aria-label="Precipitation chart showing rainfall and probability along the route"
        >
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(PrecipitationChart);
