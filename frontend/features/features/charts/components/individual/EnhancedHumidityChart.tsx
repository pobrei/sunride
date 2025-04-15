'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  Brush
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { ForecastPoint, WeatherData } from '@frontend/features/weather/types';
import { formatDistance, formatDateTime } from '@shared/utils/formatUtils';
import { cn } from '@shared/lib/utils';
import { RefreshCw } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';

interface EnhancedHumidityChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
  className?: string;
}

interface ChartDataPoint {
  distance: number;
  timestamp: number;
  humidity: number | null;
  index: number;
}

const EnhancedHumidityChart: React.FC<EnhancedHumidityChartProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
  className,
}) => {
  // State for zoom functionality
  const [zoomDomain, setZoomDomain] = useState<{ start: number; end: number } | null>(null);
  const [startZoom, setStartZoom] = useState<number | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [xAxisMode, setXAxisMode] = useState<'distance' | 'time'>('distance');
  const [hasError, setHasError] = useState(false);

  // Error handling for recharts
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('recharts') || event.message.includes('chart')) {
        console.error('Chart error detected:', event.message);
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (!forecastPoints.length || !weatherData.length || hasError) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Humidity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full bg-muted/20 rounded-md flex items-center justify-center">
            <div className="text-center p-4">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
              <div className="text-muted-foreground text-sm">
                {hasError ? 'Error loading humidity chart' : 'No humidity data available'}
              </div>
              {hasError && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setHasError(false)}
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart
  const chartData: ChartDataPoint[] = forecastPoints.map((point, index) => {
    const weather = weatherData[index];
    return {
      distance: point.distance,
      timestamp: point.timestamp,
      humidity: weather ? (weather.humidity !== undefined ? weather.humidity : 50) : null,
      index,
    };
  }).filter(point => point.humidity !== null);

  // Calculate min and max values for better chart display
  const humidityValues = chartData.map(d => d.humidity).filter(Boolean) as number[];

  const minHumidity = Math.max(0, Math.floor(Math.min(...humidityValues) - 5));
  const maxHumidity = Math.min(100, Math.ceil(Math.max(...humidityValues) + 5));

  const minDistance = 0;
  const maxDistance = Math.max(...chartData.map(d => d.distance));

  const minTime = Math.min(...chartData.map(d => d.timestamp));
  const maxTime = Math.max(...chartData.map(d => d.timestamp));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data) return null;

      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md text-xs">
          <p className="font-semibold">{formatDateTime(data.timestamp)}</p>
          <p>{`Distance: ${formatDistance(data.distance)}`}</p>
          {data.humidity !== null && data.humidity !== undefined && (
            <p>{`Humidity: ${data.humidity}%`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Handle chart click
  const handleChartClick = (data: any) => {
    if (isZooming || !data || !data.activePayload || !data.activePayload[0]) return;

    const clickedPoint = data.activePayload[0].payload;
    onChartClick(clickedPoint.index);
  };

  // Handle zoom functionality
  const handleMouseDown = (e: any) => {
    if (!e || !e.activeLabel) return;
    setStartZoom(parseFloat(e.activeLabel));
    setIsZooming(true);
  };

  const handleMouseMove = (e: any) => {
    if (!isZooming || !startZoom || !e || !e.activeLabel) return;

    const currentValue = parseFloat(e.activeLabel);
    setZoomDomain({
      start: Math.min(startZoom, currentValue),
      end: Math.max(startZoom, currentValue),
    });
  };

  const handleMouseUp = () => {
    if (!isZooming || !zoomDomain) {
      setIsZooming(false);
      setStartZoom(null);
      return;
    }

    // Only apply zoom if the area is significant
    const range = xAxisMode === 'distance' ? maxDistance - minDistance : maxTime - minTime;
    if (Math.abs(zoomDomain.end - zoomDomain.start) > range * 0.05) {
      // Zoom is now applied via the domain state
    } else {
      // Reset zoom if the area is too small
      setZoomDomain(null);
    }

    setIsZooming(false);
    setStartZoom(null);
  };

  // Reset zoom
  const resetZoom = () => {
    setZoomDomain(null);
  };

  // Toggle x-axis mode
  const toggleXAxisMode = () => {
    setXAxisMode(prev => prev === 'distance' ? 'time' : 'distance');
    setZoomDomain(null); // Reset zoom when changing axis mode
  };

  // Format x-axis ticks
  const formatXAxisTick = (value: number) => {
    if (xAxisMode === 'distance') {
      return `${Math.round(value)}km`;
    } else {
      // Format timestamp to hours:minutes
      const date = new Date(value * 1000);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  };

  // Wrap the chart rendering in a try-catch block
  try {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Humidity</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleXAxisMode}
              className="text-xs h-8"
            >
              {xAxisMode === 'distance' ? 'Show Time' : 'Show Distance'}
            </Button>
            {zoomDomain && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetZoom}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                onClick={handleChartClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis
                  dataKey={xAxisMode === 'distance' ? 'distance' : 'timestamp'}
                  type="number"
                  domain={
                    zoomDomain
                      ? [zoomDomain.start, zoomDomain.end]
                      : xAxisMode === 'distance'
                        ? [minDistance, maxDistance]
                        : [minTime, maxTime]
                  }
                  tickFormatter={formatXAxisTick}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis
                  domain={[minHumidity, maxHumidity]}
                  tickFormatter={(value) => `${value}%`}
                  stroke="hsl(var(--foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity"
                  stroke="hsl(var(--blue-500))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: 'hsl(var(--background))',
                    strokeWidth: 2,
                    fill: 'hsl(var(--blue-500))'
                  }}
                />

                {/* Reference line for selected marker */}
                {selectedMarker !== null && (
                  <ReferenceLine
                    yAxisId={0}
                    x={xAxisMode === 'distance'
                      ? forecastPoints[selectedMarker].distance
                      : forecastPoints[selectedMarker].timestamp
                    }
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                )}

                {/* Zoom selection area */}
                {isZooming && startZoom !== null && zoomDomain && (
                  <ReferenceArea
                    yAxisId={0}
                    x1={zoomDomain.start}
                    x2={zoomDomain.end}
                    strokeOpacity={0.3}
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                  />
                )}

                {/* Brush for additional navigation */}
                <Brush
                  dataKey={xAxisMode === 'distance' ? 'distance' : 'timestamp'}
                  height={30}
                  stroke="hsl(var(--primary))"
                  tickFormatter={formatXAxisTick}
                  startIndex={0}
                  endIndex={chartData.length - 1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error rendering humidity chart:', error);
    setHasError(true);

    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Humidity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full bg-muted/20 rounded-md flex items-center justify-center">
            <div className="text-center p-4">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
              <div className="text-muted-foreground text-sm">Error rendering humidity chart</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setHasError(false)}
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
};

export default EnhancedHumidityChart;
