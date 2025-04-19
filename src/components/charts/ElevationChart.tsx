'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import BaseChart from './BaseChart';
import { ForecastPoint, GPXData, WeatherData } from '@/types';
import { formatDistance } from '@/utils/formatters';
import { chartTheme } from './chart-theme';

interface ElevationChartProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData?: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
}

const ElevationChart: React.FC<ElevationChartProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartData, setChartData] = useState<
    Array<{
      name: string;
      distance: number;
      elevation: number;
      index: number;
      isSelected: boolean;
    }>
  >([]);

  // Check for dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(darkModeQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };

      darkModeQuery.addEventListener('change', handleChange);
      return () => darkModeQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Prepare chart data
  useEffect(() => {
    if (!gpxData || !gpxData.points || gpxData.points.length === 0) return;

    // Sample points to avoid too many data points
    const sampleRate = Math.max(1, Math.floor(gpxData.points.length / 100));

    const data = gpxData.points
      .filter((_, i) => i % sampleRate === 0)
      .map(point => {
        const distance = point.distance || 0;
        // Ensure elevation is never negative
        const elevation = Math.max(0, point.elevation || 0);

        // Find the closest forecast point to this GPX point
        let closestForecastIndex = -1;
        let minDistance = Infinity;

        forecastPoints.forEach((fp, fpIndex) => {
          const distDiff = Math.abs(fp.distance - distance);
          if (distDiff < minDistance) {
            minDistance = distDiff;
            closestForecastIndex = fpIndex;
          }
        });

        return {
          name: formatDistance(distance * 1000), // Convert km to meters before formatting
          distance: distance,
          elevation: elevation,
          index: closestForecastIndex,
          isSelected: closestForecastIndex === selectedMarker,
        };
      });

    setChartData(data);
  }, [gpxData, forecastPoints, selectedMarker]);

  // Handle chart click
  const handleClick = (data: { activePayload?: Array<{ payload: { index: number } }> }) => {
    if (onChartClick && data?.activePayload?.[0]?.payload) {
      const index = data.activePayload[0].payload.index;
      if (index >= 0) {
        onChartClick(index);
      }
    }
  };

  // Get theme colors
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;

  // If no GPX data, show a message
  if (!gpxData || !gpxData.points || gpxData.points.length === 0) {
    return (
      <ChartCard title="Elevation" unitLabel="m">
        <div className="h-[350px] w-full flex items-center justify-center">
          <p className="text-[#1E2A38] dark:text-[#F5F7FA] opacity-70">
            No elevation data available
          </p>
        </div>
      </ChartCard>
    );
  }

  return (
    <BaseChart title="Elevation" unitLabel="m" forecastPoints={forecastPoints} weatherData={weatherData} selectedMarker={selectedMarker} onChartClick={onChartClick}>
      <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
            onClick={handleClick}
          >
            {/* No gradients in flat design */}
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke={theme.text}
              fontSize={12}
              tickLine={true}
              axisLine={{ stroke: theme.grid }}
              dy={15}
            />
            <YAxis
              stroke={theme.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              dx={-10}
              domain={[0, 'auto']} // Set minimum domain to 0 to prevent negative values
              allowDataOverflow={true} // Allow data to overflow the domain
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.card,
                borderColor: theme.grid,
                color: theme.text
              }}
              labelStyle={{ color: theme.text }}
              formatter={(value: number) => {
                // Ensure elevation is never negative in the tooltip
                return [Math.max(0, value) + ' m', 'Elevation'];
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: theme.text }}
            />
            <Area
              key="elevation-area"
              type="monotone"
              dataKey="elevation"
              name="Elevation (m)"
              stroke={theme.elevation}
              fillOpacity={0.05}
              fill={theme.elevation}
              activeDot={{
                r: 6,
                stroke: theme.card,
                strokeWidth: 1,
                fill: theme.elevation,
              }}
              dot={(props: { cx: number; cy: number; payload: { isSelected: boolean } }) => {
                const { cx, cy, payload } = props;
                return payload.isSelected ? (
                  <circle
                    key={`dot-${cx}-${cy}-selected`}
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill="#10b981"
                    stroke={theme.card}
                    strokeWidth={2}
                  />
                ) : null; // Don't show dots for non-selected points to avoid clutter
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
    </BaseChart>
  );
};

export default ElevationChart;
