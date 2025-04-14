'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatters';

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
      
      console.log(`UV Index chart clicked at index: ${index}`);
      onChartClick(index);
    }
  };

  // Get color for UV index based on value
  const getUVColor = (uvIndex: number) => {
    if (uvIndex <= 2) return 'rgba(0, 128, 0, 0.7)'; // Low - Green
    if (uvIndex <= 5) return 'rgba(255, 165, 0, 0.7)'; // Moderate - Orange
    if (uvIndex <= 7) return 'rgba(255, 69, 0, 0.7)'; // High - Red-Orange
    if (uvIndex <= 10) return 'rgba(255, 0, 0, 0.7)'; // Very High - Red
    return 'rgba(128, 0, 128, 0.7)'; // Extreme - Purple
  };

  // Get color scheme based on dark/light mode
  const getColorScheme = () => {
    // Check if we're in dark mode
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return isDarkMode 
      ? {
          uvIndex: {
            bg: 'rgba(255, 165, 0, 0.3)',
            border: 'rgb(255, 140, 0)',
            point: 'rgb(255, 140, 0)'
          }
        }
      : {
          uvIndex: {
            bg: 'rgba(255, 220, 180, 0.3)',
            border: 'rgb(255, 165, 0)',
            point: 'rgb(255, 165, 0)'
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
      displayColors: true,
      callbacks: {
        label: function(context) {
          const value = context.parsed.y;
          let label = `UV Index: ${value}`;
          
          // Add risk level
          if (value <= 2) label += ' (Low)';
          else if (value <= 5) label += ' (Moderate)';
          else if (value <= 7) label += ' (High)';
          else if (value <= 10) label += ' (Very High)';
          else label += ' (Extreme)';
          
          return label;
        }
      }
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

    const uvIndexData = forecastPoints.map((_, i) => weatherData[i]?.uvIndex ?? 0);

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
                label: 'UV Index',
                data: uvIndexData,
                backgroundColor: (context) => {
                  const value = context.raw as number;
                  return getUVColor(value);
                },
                borderColor: colors.uvIndex.border,
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: (context) => {
                  const value = context.raw as number;
                  const color = getUVColor(value);
                  return color.replace('0.7', '0.9'); // Make hover slightly more opaque
                },
              }
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
                min: 0,
                max: 12,
                title: {
                  display: true,
                  text: 'UV Index'
                },
                ticks: {
                  stepSize: 1
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
        <CardTitle className="text-lg">UV Index</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="h-[250px] w-full" 
          role="img" 
          aria-label="UV Index chart showing weather data along the route"
        >
          <canvas ref={chartRef} />
        </div>
        <div className="mt-2 text-xs grid grid-cols-5 gap-1">
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 rounded-sm bg-green-600"></div>
            <span>Low (0-2)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 rounded-sm bg-orange-500"></div>
            <span>Moderate (3-5)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 rounded-sm bg-red-500 opacity-80"></div>
            <span>High (6-7)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 rounded-sm bg-red-600"></div>
            <span>Very High (8-10)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 rounded-sm bg-purple-700"></div>
            <span>Extreme (11+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(UVIndexChart);
