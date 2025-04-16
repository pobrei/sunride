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
import ChartCard from './ChartCard';
import { ForecastPoint, GPXData } from '@/types';
import { formatDistance } from '@/utils/formatters';
import { chartTheme } from './chart-theme';

interface ElevationChartProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
}

const ElevationChart: React.FC<ElevationChartProps> = ({
  gpxData,
  forecastPoints,
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
        const elevation = point.elevation || 0;

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
          name: formatDistance(distance),
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
    <ChartCard title="Elevation" unitLabel="m">
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            onClick={handleClick}
          >
            <defs>
              <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke={theme.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              dy={10}
            />
            <YAxis
              stroke={theme.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.card,
                borderColor: theme.grid,
                color: theme.text,
                borderRadius: '8px',
                boxShadow: `0 4px 12px ${theme.shadow}`,
              }}
              labelStyle={{ color: theme.text }}
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
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#elevationGradient)"
              activeDot={{
                r: 8,
                stroke: theme.card,
                strokeWidth: 2,
                fill: '#10b981',
              }}
              dot={(props: { cx: number; cy: number; payload: { isSelected: boolean } }) => {
                const { cx, cy, payload } = props;
                return payload.isSelected ? (
                  <circle
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
      </div>
    </ChartCard>
  );
};

export default ElevationChart;
