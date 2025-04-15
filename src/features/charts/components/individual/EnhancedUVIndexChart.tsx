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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { formatDistance, formatDateTime } from '@/utils/formatUtils';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedUVIndexChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
  className?: string;
}

interface ChartDataPoint {
  distance: number;
  timestamp: number;
  uvIndex: number | null;
  index: number;
}

const EnhancedUVIndexChart: React.FC<EnhancedUVIndexChartProps> = ({
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
          <CardTitle className="text-lg">UV Index</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full bg-muted/20 rounded-md flex items-center justify-center">
            <div className="text-center p-4">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
              <div className="text-muted-foreground text-sm">
                {hasError ? 'Error loading UV index chart' : 'No UV index data available'}
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
      uvIndex: weather ? (weather.uvIndex !== undefined ? weather.uvIndex : 0) : null,
      index,
    };
  }).filter(point => point.uvIndex !== null);

  // Calculate min and max values for better chart display
  const uvValues = chartData.map(d => d.uvIndex).filter(Boolean) as number[];

  const minUV = 0;
  const maxUV = Math.max(11, Math.ceil(Math.max(...uvValues) + 1));

  const minDistance = 0;
  const maxDistance = Math.max(...chartData.map(d => d.distance));

  const minTime = Math.min(...chartData.map(d => d.timestamp));
  const maxTime = Math.max(...chartData.map(d => d.timestamp));

  // Get color for UV index
  const getUVColor = (uvIndex: number) => {
    if (uvIndex <= 2) return 'hsl(var(--green-500))'; // Low
    if (uvIndex <= 5) return 'hsl(var(--yellow-500))'; // Moderate
    if (uvIndex <= 7) return 'hsl(var(--orange-500))'; // High
    if (uvIndex <= 10) return 'hsl(var(--red-500))'; // Very High
    return 'hsl(var(--purple-500))'; // Extreme
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data) return null;

      const uvIndex = data.uvIndex;
      let uvCategory = '';
      let color = '';

      if (uvIndex <= 2) {
        uvCategory = 'Low';
        color = 'text-green-500';
      } else if (uvIndex <= 5) {
        uvCategory = 'Moderate';
        color = 'text-yellow-500';
      } else if (uvIndex <= 7) {
        uvCategory = 'High';
        color = 'text-orange-500';
      } else if (uvIndex <= 10) {
        uvCategory = 'Very High';
        color = 'text-red-500';
      } else {
        uvCategory = 'Extreme';
        color = 'text-purple-500';
      }

      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md text-xs">
          <p className="font-semibold">{formatDateTime(data.timestamp)}</p>
          <p>{`Distance: ${formatDistance(data.distance)}`}</p>
          {data.uvIndex !== null && data.uvIndex !== undefined && (
            <>
              <p>{`UV Index: ${data.uvIndex}`}</p>
              <p className={color}>{`Risk: ${uvCategory}`}</p>
            </>
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
          <CardTitle className="text-lg">UV Index</CardTitle>
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
                  domain={[minUV, maxUV]}
                  tickFormatter={(value) => `${value}`}
                  stroke="hsl(var(--foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="uvIndex"
                  name="UV Index"
                  stroke="hsl(var(--purple-500))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: 'hsl(var(--background))',
                    strokeWidth: 2,
                    fill: 'hsl(var(--purple-500))'
                  }}
                />

                {/* Reference lines for UV index risk levels */}
                <ReferenceLine yAxisId={0} y={2} stroke="hsl(var(--green-500))" strokeDasharray="3 3" />
                <ReferenceLine yAxisId={0} y={5} stroke="hsl(var(--yellow-500))" strokeDasharray="3 3" />
                <ReferenceLine yAxisId={0} y={7} stroke="hsl(var(--orange-500))" strokeDasharray="3 3" />
                <ReferenceLine yAxisId={0} y={10} stroke="hsl(var(--red-500))" strokeDasharray="3 3" />

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
    console.error('Error rendering UV index chart:', error);
    setHasError(true);

    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">UV Index</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full bg-muted/20 rounded-md flex items-center justify-center">
            <div className="text-center p-4">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
              <div className="text-muted-foreground text-sm">Error rendering UV index chart</div>
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

export default EnhancedUVIndexChart;
