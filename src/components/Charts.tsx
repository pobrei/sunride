'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart, registerables } from 'chart.js';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { formatTime, formatDistance, createTemperatureGradient } from '@/utils/helpers';
import { GPXData } from '@/utils/gpxParser';

// Register Chart.js components
Chart.register(...registerables);

interface ChartsProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

// Reusable chart options
function getBaseChartOptions(onClick: (event: any, elements: any[]) => void) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'hsl(var(--card))',
        titleColor: 'hsl(var(--card-foreground))',
        bodyColor: 'hsl(var(--card-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 12,
          weight: 'normal' as const
        }
      },
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'hsl(var(--foreground))'
        }
      },
      y: {
        grid: {
          borderDash: [2, 2],
          color: 'hsl(var(--border))'
        },
        ticks: {
          color: 'hsl(var(--foreground))'
        }
      }
    },
    onClick: onClick
  };
}

export default function Charts({ gpxData, forecastPoints, weatherData, selectedMarker, onChartClick }: ChartsProps) {
  const tempChartRef = useRef<HTMLCanvasElement | null>(null);
  const precipChartRef = useRef<HTMLCanvasElement | null>(null);
  const windChartRef = useRef<HTMLCanvasElement | null>(null);
  const humidityChartRef = useRef<HTMLCanvasElement | null>(null);
  const pressureChartRef = useRef<HTMLCanvasElement | null>(null);
  const elevationChartRef = useRef<HTMLCanvasElement | null>(null);

  const chartInstancesRef = useRef<{
    tempChart?: Chart;
    precipChart?: Chart;
    windChart?: Chart;
    humidityChart?: Chart;
    pressureChart?: Chart;
    elevationChart?: Chart;
  }>({});

  // Clean up chart instances on unmount
  useEffect(() => {
    return () => {
      Object.values(chartInstancesRef.current).forEach(chart => {
        chart?.destroy();
      });
    };
  }, []);

  // Create or update charts
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

    // Temperature chart
    if (tempChartRef.current) {
      const ctx = tempChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart
        if (chartInstancesRef.current.tempChart) {
          chartInstancesRef.current.tempChart.destroy();
        }

        const minTemp = Math.min(...tempData.filter(t => !isNaN(t)));
        const maxTemp = Math.max(...tempData.filter(t => !isNaN(t)));
        
        chartInstancesRef.current.tempChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Temperature (°C)',
                data: tempData,
                borderColor: 'hsl(265, 60%, 75%)',
                backgroundColor: 'hsla(265, 60%, 75%, 0.2)',
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: 'hsl(265, 60%, 75%)',
                pointRadius: (ctx) => {
                  const index = ctx.dataIndex;
                  return index === selectedMarker ? 6 : 3;
                },
                pointHoverRadius: 8,
                fill: true,
              },
              {
                label: 'Feels Like (°C)',
                data: feelsLikeData,
                borderColor: 'hsl(225, 25%, 45%)',
                borderDash: [5, 5],
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: 'hsl(225, 25%, 45%)',
                pointRadius: 0,
                pointHoverRadius: 5,
                fill: false,
              },
            ],
          },
          options: getBaseChartOptions(onChartClick),
        });
      }
    }

    // Precipitation chart
    if (precipChartRef.current) {
      const ctx = precipChartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstancesRef.current.precipChart) {
          chartInstancesRef.current.precipChart.destroy();
        }

        chartInstancesRef.current.precipChart = new Chart(ctx, {
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
                borderColor: 'hsl(195, 60%, 80%)',
                borderWidth: 1,
                borderRadius: 5,
              },
            ],
          },
          options: getBaseChartOptions(onChartClick),
        });
      }
    }

    // Wind chart
    if (windChartRef.current) {
      const ctx = windChartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstancesRef.current.windChart) {
          chartInstancesRef.current.windChart.destroy();
        }

        chartInstancesRef.current.windChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Wind Speed (m/s)',
                data: windSpeedData,
                borderColor: 'hsl(45, 70%, 85%)',
                backgroundColor: 'hsla(45, 70%, 85%, 0.3)',
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: 'hsl(45, 70%, 85%)',
                pointRadius: (ctx) => {
                  const index = ctx.dataIndex;
                  return index === selectedMarker ? 6 : 3;
                },
                pointHoverRadius: 8,
                fill: true,
              },
            ],
          },
          options: getBaseChartOptions(onChartClick),
        });
      }
    }

    // Humidity chart
    if (humidityChartRef.current) {
      const ctx = humidityChartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstancesRef.current.humidityChart) {
          chartInstancesRef.current.humidityChart.destroy();
        }

        chartInstancesRef.current.humidityChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Humidity (%)',
                data: humidityData,
                borderColor: 'hsl(195, 60%, 80%)',
                backgroundColor: 'hsla(195, 60%, 80%, 0.3)',
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: 'hsl(195, 60%, 80%)',
                pointRadius: (ctx) => {
                  const index = ctx.dataIndex;
                  return index === selectedMarker ? 6 : 3;
                },
                pointHoverRadius: 8,
                fill: true,
              },
            ],
          },
          options: getBaseChartOptions(onChartClick),
        });
      }
    }

    // Pressure chart
    if (pressureChartRef.current) {
      const ctx = pressureChartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstancesRef.current.pressureChart) {
          chartInstancesRef.current.pressureChart.destroy();
        }

        chartInstancesRef.current.pressureChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Pressure (hPa)',
                data: pressureData,
                borderColor: 'hsl(345, 60%, 75%)',
                backgroundColor: 'hsla(345, 60%, 75%, 0.3)',
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: 'hsl(345, 60%, 75%)',
                pointRadius: (ctx) => {
                  const index = ctx.dataIndex;
                  return index === selectedMarker ? 6 : 3;
                },
                pointHoverRadius: 8,
                fill: true,
              },
            ],
          },
          options: getBaseChartOptions(onChartClick),
        });
      }
    }

    // Elevation chart
    if (elevationChartRef.current) {
      const ctx = elevationChartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstancesRef.current.elevationChart) {
          chartInstancesRef.current.elevationChart.destroy();
        }

        chartInstancesRef.current.elevationChart = new Chart(ctx, {
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
                pointBackgroundColor: 'hsl(160, 50%, 75%)',
                pointRadius: (ctx) => {
                  const index = ctx.dataIndex;
                  return index === selectedMarker ? 6 : 3;
                },
                pointHoverRadius: 8,
                fill: true,
              },
            ],
          },
          options: getBaseChartOptions(onChartClick),
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
} 