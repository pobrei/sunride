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
                borderColor: '#FF6E40',
                backgroundColor: ctx ? createTemperatureGradient(ctx, minTemp, maxTemp) : 'rgba(255, 99, 132, 0.5)',
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: '#FF6E40',
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
                borderColor: '#FFA726',
                borderDash: [5, 5],
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: '#FFA726',
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
              tooltip: {
                mode: 'index',
                intersect: false,
              },
              legend: {
                position: 'top',
                labels: {
                  color: '#e0e0e0',
                  font: {
                    size: 12,
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: '#9e9e9e',
                  maxRotation: 0,
                  autoSkip: true,
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
              y: {
                ticks: {
                  color: '#9e9e9e',
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
                title: {
                  display: true,
                  text: 'Temperature (°C)',
                  color: '#e0e0e0',
                },
              },
            },
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                onChartClick(index);
              }
            },
          },
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
                  if (value > 5) return 'rgba(103, 58, 183, 0.8)'; // Heavy rain
                  if (value > 2) return 'rgba(103, 58, 183, 0.6)'; // Moderate rain
                  return 'rgba(103, 58, 183, 0.4)'; // Light rain
                },
                borderColor: 'rgba(103, 58, 183, 1)',
                borderWidth: 1,
                borderRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                mode: 'index',
                intersect: false,
              },
              legend: {
                position: 'top',
                labels: {
                  color: '#e0e0e0',
                  font: {
                    size: 12,
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: '#9e9e9e',
                  maxRotation: 0,
                  autoSkip: true,
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
              y: {
                ticks: {
                  color: '#9e9e9e',
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
                title: {
                  display: true,
                  text: 'Precipitation (mm)',
                  color: '#e0e0e0',
                },
                beginAtZero: true,
              },
            },
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                onChartClick(index);
              }
            },
          },
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
                borderColor: '#FFC107',
                backgroundColor: 'rgba(255, 193, 7, 0.3)',
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: '#FFC107',
                pointRadius: (ctx) => {
                  const index = ctx.dataIndex;
                  return index === selectedMarker ? 6 : 3;
                },
                pointHoverRadius: 8,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  afterLabel: (context) => {
                    const index = context.dataIndex;
                    const direction = windDirectionData[index];
                    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
                    const ix = Math.floor((direction + 22.5) / 45) % 8;
                    return `Direction: ${dirs[ix]} (${Math.round(direction)}°)`;
                  },
                },
              },
              legend: {
                position: 'top',
                labels: {
                  color: '#e0e0e0',
                  font: {
                    size: 12,
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: '#9e9e9e',
                  maxRotation: 0,
                  autoSkip: true,
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
              y: {
                ticks: {
                  color: '#9e9e9e',
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
                title: {
                  display: true,
                  text: 'Wind Speed (m/s)',
                  color: '#e0e0e0',
                },
                beginAtZero: true,
              },
            },
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                onChartClick(index);
              }
            },
          },
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
                borderColor: '#29B6F6',
                backgroundColor: 'rgba(41, 182, 246, 0.3)',
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: '#29B6F6',
                pointRadius: (ctx) => {
                  const index = ctx.dataIndex;
                  return index === selectedMarker ? 6 : 3;
                },
                pointHoverRadius: 8,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                mode: 'index',
                intersect: false,
              },
              legend: {
                position: 'top',
                labels: {
                  color: '#e0e0e0',
                  font: {
                    size: 12,
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: '#9e9e9e',
                  maxRotation: 0,
                  autoSkip: true,
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
              y: {
                ticks: {
                  color: '#9e9e9e',
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
                title: {
                  display: true,
                  text: 'Humidity (%)',
                  color: '#e0e0e0',
                },
                beginAtZero: true,
                max: 100,
              },
            },
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                onChartClick(index);
              }
            },
          },
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
                borderColor: '#7E57C2',
                backgroundColor: 'rgba(126, 87, 194, 0.3)',
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: '#7E57C2',
                pointRadius: (ctx) => {
                  const index = ctx.dataIndex;
                  return index === selectedMarker ? 6 : 3;
                },
                pointHoverRadius: 8,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                mode: 'index',
                intersect: false,
              },
              legend: {
                position: 'top',
                labels: {
                  color: '#e0e0e0',
                  font: {
                    size: 12,
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: '#9e9e9e',
                  maxRotation: 0,
                  autoSkip: true,
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
              y: {
                ticks: {
                  color: '#9e9e9e',
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
                title: {
                  display: true,
                  text: 'Pressure (hPa)',
                  color: '#e0e0e0',
                },
              },
            },
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                onChartClick(index);
              }
            },
          },
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
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.3)',
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: '#4CAF50',
                pointRadius: (ctx) => {
                  const index = ctx.dataIndex;
                  return index === selectedMarker ? 6 : 3;
                },
                pointHoverRadius: 8,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                mode: 'index',
                intersect: false,
              },
              legend: {
                position: 'top',
                labels: {
                  color: '#e0e0e0',
                  font: {
                    size: 12,
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: '#9e9e9e',
                  maxRotation: 0,
                  autoSkip: true,
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
              y: {
                ticks: {
                  color: '#9e9e9e',
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
                title: {
                  display: true,
                  text: 'Elevation (m)',
                  color: '#e0e0e0',
                },
              },
            },
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                onChartClick(index);
              }
            },
          },
        });
      }
    }
  }, [forecastPoints, weatherData, gpxData, selectedMarker, onChartClick]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
      <Card className="bg-[#1c1c1e] border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Temperature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <canvas ref={tempChartRef} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1c1c1e] border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Precipitation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <canvas ref={precipChartRef} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1c1c1e] border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Wind</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <canvas ref={windChartRef} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1c1c1e] border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Humidity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <canvas ref={humidityChartRef} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1c1c1e] border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pressure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <canvas ref={pressureChartRef} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1c1c1e] border-neutral-800">
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