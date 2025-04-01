'use client';

import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { ChartEvent, ActiveElement } from 'chart.js';
import styles from './Charts.module.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { formatTime, formatDistance } from '@/utils/helpers';
import { GPXData } from '@/utils/gpxParser';

// Define RouteInfo interface locally if needed
interface RouteInfo {
  name: string;
  distance: number;
  elevation: number;
  duration: number;
  points: Array<{
    lat: number;
    lon: number;
    elevation?: number;
    time?: string;
  }>;
}

interface ChartsProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const Charts: React.FC<ChartsProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
}) => {
  const tempChartRef = useRef<HTMLCanvasElement>(null);
  const humidityChartRef = useRef<HTMLCanvasElement>(null);
  const precipChartRef = useRef<HTMLCanvasElement>(null);
  const windChartRef = useRef<HTMLCanvasElement>(null);
  const elevationChartRef = useRef<HTMLCanvasElement>(null);
  const pressureChartRef = useRef<HTMLCanvasElement>(null);
  
  // Chart instances refs for cleanup
  const tempChartInstance = useRef<Chart | null>(null);
  const humidityChartInstance = useRef<Chart | null>(null);
  const precipChartInstance = useRef<Chart | null>(null);
  const windChartInstance = useRef<Chart | null>(null);
  const elevationChartInstance = useRef<Chart | null>(null);
  const pressureChartInstance = useRef<Chart | null>(null);
  
  // Direct click handler for charts
  const handleChartClick = (event: MouseEvent, chart: Chart) => {
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const points = chart.getElementsAtEventForMode(
      event,
      'nearest',
      { intersect: true },
      false
    );
    
    if (points.length) {
      const firstPoint = points[0];
      const index = firstPoint.index;
      console.log(`Direct chart click detected at index: ${index}`);
      onChartClick(index);
    } else {
      // Try using x position to determine the closest point
      if (chart.data.labels && chart.data.labels.length > 0) {
        const chartArea = chart.chartArea;
        const xPercent = (x - chartArea.left) / (chartArea.right - chartArea.left);
        const index = Math.min(
          Math.max(0, Math.floor(xPercent * chart.data.labels.length)),
          chart.data.labels.length - 1
        );
        console.log(`Calculated index from x position: ${index}`);
        onChartClick(index);
      }
    }
  };

  useEffect(() => {
    // Add direct click handler to temperature chart
    const handleTempChartClick = (e: MouseEvent) => {
      if (!tempChartInstance.current) return;
      
      const canvas = e.target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      const chartArea = tempChartInstance.current.chartArea;
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
    
    if (tempChartRef.current) {
      tempChartRef.current.addEventListener('click', handleTempChartClick as any);
    }
    
    return () => {
      if (tempChartRef.current) {
        tempChartRef.current.removeEventListener('click', handleTempChartClick as any);
      }
    };
  }, [forecastPoints.length, onChartClick]);

  useEffect(() => {
    return () => {
      tempChartInstance.current?.destroy();
      humidityChartInstance.current?.destroy();
      precipChartInstance.current?.destroy();
      windChartInstance.current?.destroy();
      elevationChartInstance.current?.destroy();
      pressureChartInstance.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (forecastPoints.length === 0 || weatherData.length === 0 || !gpxData) return;

    // Prepare data
    const validWeatherData = weatherData.filter(data => data !== null) as WeatherData[];
    if (validWeatherData.length === 0) return;

    const labels = forecastPoints.map((point, i) => {
      return `${formatTime(point.timestamp)}\n${formatDistance(point.distance)}`;
    });

    const tempData = forecastPoints.map((_, i) => weatherData[i]?.temperature ?? 0);
    const feelsLikeData = forecastPoints.map((_, i) => weatherData[i]?.feelsLike ?? 0);
    const precipData = forecastPoints.map((_, i) => weatherData[i]?.rain ?? 0);
    const windSpeedData = forecastPoints.map((_, i) => weatherData[i]?.windSpeed ?? 0);
    const windDirectionData = forecastPoints.map((_, i) => weatherData[i]?.windDirection ?? 0);
    const humidityData = forecastPoints.map((_, i) => weatherData[i]?.humidity ?? 0);
    const pressureData = forecastPoints.map((_, i) => weatherData[i]?.pressure ?? 0);
    
    // Get elevation data for each forecast point
    const elevationData: number[] = [];
    
    forecastPoints.forEach(point => {
      // Find closest GPX point by distance
      let closestPoint = gpxData.points[0];
      let closestDistance = Math.abs(point.distance - closestPoint.distance);
      
      for (const gpxPoint of gpxData.points) {
        const distance = Math.abs(point.distance - gpxPoint.distance);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPoint = gpxPoint;
        }
      }
      
      elevationData.push(closestPoint.elevation);
    });

    // Define soft, pale color scheme for all charts
    const chartColors = {
      // Light mode colors
      light: {
        temperature: {
          bg: 'rgba(255, 232, 238, 0.3)',
          border: 'rgb(255, 182, 193)',
          point: 'rgb(255, 182, 193)'
        },
        humidity: {
          bg: 'rgba(230, 230, 250, 0.3)',
          border: 'rgb(204, 204, 255)',
          point: 'rgb(204, 204, 255)'
        },
        pressure: {
          bg: 'rgba(255, 250, 205, 0.3)',
          border: 'rgb(255, 223, 186)',
          point: 'rgb(255, 223, 186)'
        },
        wind: {
          bg: 'rgba(220, 240, 247, 0.3)',
          border: 'rgb(173, 216, 230)',
          point: 'rgb(173, 216, 230)'
        },
        rain: {
          bg: 'rgba(255, 228, 225, 0.3)',
          border: 'rgb(255, 182, 193)',
          point: 'rgb(255, 182, 193)'
        },
        feelsLike: {
          bg: 'rgba(220, 255, 220, 0.3)',
          border: 'rgb(152, 251, 152)',
          point: 'rgb(152, 251, 152)'
        }
      },
      // Dark mode colors - deeper but still readable
      dark: {
        temperature: {
          bg: 'rgba(130, 50, 70, 0.3)',
          border: 'rgb(180, 70, 90)',
          point: 'rgb(180, 70, 90)'
        },
        humidity: {
          bg: 'rgba(100, 80, 140, 0.3)',
          border: 'rgb(130, 110, 180)',
          point: 'rgb(130, 110, 180)'
        },
        pressure: {
          bg: 'rgba(130, 110, 60, 0.3)',
          border: 'rgb(170, 150, 80)',
          point: 'rgb(170, 150, 80)'
        },
        wind: {
          bg: 'rgba(70, 130, 160, 0.3)',
          border: 'rgb(100, 160, 190)',
          point: 'rgb(100, 160, 190)'
        },
        rain: {
          bg: 'rgba(130, 60, 70, 0.3)',
          border: 'rgb(170, 80, 90)',
          point: 'rgb(170, 80, 90)'
        },
        feelsLike: {
          bg: 'rgba(60, 130, 80, 0.3)',
          border: 'rgb(80, 170, 100)',
          point: 'rgb(80, 170, 100)'
        }
      }
    };

    // Function to get the appropriate color scheme based on color mode
    const getColorScheme = () => {
      // Check if we're in dark mode
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDarkMode ? chartColors.dark : chartColors.light;
    };

    // Define custom tooltip styling for charts
    const getTooltipOptions = () => {
      // Check if we're in dark mode
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

    // For scales that need dashed grid lines, create a custom grid line function
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

    // Temperature chart
    if (tempChartRef.current) {
      const ctx = tempChartRef.current.getContext('2d');
      if (ctx) {
        if (tempChartInstance.current) {
          tempChartInstance.current.destroy();
        }

        const colors = getColorScheme();
        tempChartInstance.current = new Chart(ctx, {
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
            onClick: function(event: ChartEvent, elements: ActiveElement[]) {
              console.log('Chart clicked!', elements);
              if (elements && elements.length > 0) {
                const clickedIndex = elements[0].index;
                console.log('Clicked chart point at index:', clickedIndex);
                onChartClick(clickedIndex);
              }
            }
          },
        });
        
        // Add direct click handler
        tempChartRef.current.addEventListener('click', (event) => {
          handleChartClick(event, tempChartInstance.current as Chart);
        });
      }
    }

    // Precipitation chart
    if (precipChartRef.current) {
      const ctx = precipChartRef.current.getContext('2d');
      if (ctx) {
        if (precipChartInstance.current) {
          precipChartInstance.current.destroy();
        }

        const colors = getColorScheme();
        precipChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Precipitation (mm)',
                data: precipData,
                backgroundColor: (context) => {
                  const index = context.dataIndex;
                  const value = context.dataset.data[index] as number;
                  if (value > 5) return 'hsla(195, 60%, 80%, 0.8)'; // Heavy rain
                  if (value > 2) return 'hsla(195, 60%, 80%, 0.6)'; // Moderate rain
                  return 'hsla(195, 60%, 80%, 0.4)'; // Light rain
                },
                borderColor: colors.rain.border,
                borderWidth: 1,
                borderRadius: 5,
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
                min: 0,
                max: Math.max(...precipData) + 5,
                title: {
                  display: true,
                  text: 'Precipitation (mm)'
                }
              }
            },
            onClick: function(event: ChartEvent, elements: ActiveElement[]) {
              console.log('Chart clicked!', elements);
              if (elements && elements.length > 0) {
                const clickedIndex = elements[0].index;
                console.log('Clicked chart point at index:', clickedIndex);
                onChartClick(clickedIndex);
              }
            }
          },
        });
        
        // Add direct click handler
        precipChartRef.current.addEventListener('click', (event) => {
          handleChartClick(event, precipChartInstance.current as Chart);
        });
      }
    }

    // Wind chart
    if (windChartRef.current) {
      const ctx = windChartRef.current.getContext('2d');
      if (ctx) {
        if (windChartInstance.current) {
          windChartInstance.current.destroy();
        }

        const colors = getColorScheme();
        windChartInstance.current = new Chart(ctx, {
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
                pointBackgroundColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'blue' : colors.wind.point;
                },
                pointBorderColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'white' : colors.wind.border;
                },
                pointRadius: (context) => {
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
                min: Math.min(...windSpeedData) - 5,
                max: Math.max(...windSpeedData) + 5,
                title: {
                  display: true,
                  text: 'Wind Speed (m/s)'
                }
              }
            },
            onClick: function(event: ChartEvent, elements: ActiveElement[]) {
              console.log('Chart clicked!', elements);
              if (elements && elements.length > 0) {
                const clickedIndex = elements[0].index;
                console.log('Clicked chart point at index:', clickedIndex);
                onChartClick(clickedIndex);
              }
            }
          },
        });
        
        // Add direct click handler
        windChartRef.current.addEventListener('click', (event) => {
          handleChartClick(event, windChartInstance.current as Chart);
        });
      }
    }

    // Humidity chart
    if (humidityChartRef.current) {
      const ctx = humidityChartRef.current.getContext('2d');
      if (ctx) {
        if (humidityChartInstance.current) {
          humidityChartInstance.current.destroy();
        }

        const colors = getColorScheme();
        humidityChartInstance.current = new Chart(ctx, {
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
                pointBackgroundColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'blue' : colors.humidity.point;
                },
                pointBorderColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'white' : colors.humidity.border;
                },
                pointRadius: (context) => {
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
                max: 100,
                title: {
                  display: true,
                  text: 'Humidity (%)'
                }
              }
            },
            onClick: function(event: ChartEvent, elements: ActiveElement[]) {
              console.log('Chart clicked!', elements);
              if (elements && elements.length > 0) {
                const clickedIndex = elements[0].index;
                console.log('Clicked chart point at index:', clickedIndex);
                onChartClick(clickedIndex);
              }
            }
          },
        });
        
        // Add direct click handler
        humidityChartRef.current.addEventListener('click', (event) => {
          handleChartClick(event, humidityChartInstance.current as Chart);
        });
      }
    }

    // Pressure chart
    if (pressureChartRef.current) {
      const ctx = pressureChartRef.current.getContext('2d');
      if (ctx) {
        if (pressureChartInstance.current) {
          pressureChartInstance.current.destroy();
        }

        const colors = getColorScheme();
        pressureChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Pressure (hPa)',
                data: pressureData,
                borderColor: colors.pressure.border,
                backgroundColor: colors.pressure.bg,
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'blue' : colors.pressure.point;
                },
                pointBorderColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'white' : colors.pressure.border;
                },
                pointRadius: (context) => {
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
                min: Math.min(...pressureData) - 5,
                max: Math.max(...pressureData) + 5,
                title: {
                  display: true,
                  text: 'Pressure (hPa)'
                }
              }
            },
            onClick: function(event: ChartEvent, elements: ActiveElement[]) {
              console.log('Chart clicked!', elements);
              if (elements && elements.length > 0) {
                const clickedIndex = elements[0].index;
                console.log('Clicked chart point at index:', clickedIndex);
                onChartClick(clickedIndex);
              }
            }
          },
        });
        
        // Add direct click handler
        pressureChartRef.current.addEventListener('click', (event) => {
          handleChartClick(event, pressureChartInstance.current as Chart);
        });
      }
    }

    // Elevation chart
    if (elevationChartRef.current) {
      const ctx = elevationChartRef.current.getContext('2d');
      if (ctx) {
        if (elevationChartInstance.current) {
          elevationChartInstance.current.destroy();
        }

        elevationChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Elevation (m)',
                data: elevationData,
                borderColor: 'hsl(160, 50%, 75%)',
                backgroundColor: 'hsla(160, 50%, 75%, 0.3)',
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'blue' : 'hsl(160, 50%, 75%)';
                },
                pointBorderColor: (context) => {
                  const index = context.dataIndex;
                  return selectedMarker === index ? 'white' : 'hsl(160, 50%, 75%)';
                },
                pointRadius: (context) => {
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
                min: Math.min(...elevationData) - 5,
                max: Math.max(...elevationData) + 5,
                title: {
                  display: true,
                  text: 'Elevation (m)'
                }
              }
            },
            onClick: function(event: ChartEvent, elements: ActiveElement[]) {
              console.log('Chart clicked!', elements);
              if (elements && elements.length > 0) {
                const clickedIndex = elements[0].index;
                console.log('Clicked chart point at index:', clickedIndex);
                onChartClick(clickedIndex);
              }
            }
          },
        });
        
        // Add direct click handler
        elevationChartRef.current.addEventListener('click', (event) => {
          handleChartClick(event, elevationChartInstance.current as Chart);
        });
      }
    }
  }, [forecastPoints, weatherData, gpxData, selectedMarker, onChartClick]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Temperature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <canvas ref={tempChartRef} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Precipitation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <canvas ref={precipChartRef} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Wind</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <canvas ref={windChartRef} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Humidity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <canvas ref={humidityChartRef} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pressure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <canvas ref={pressureChartRef} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Elevation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <canvas ref={elevationChartRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Charts;