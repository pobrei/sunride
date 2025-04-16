'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import ChartCard from './ChartCard';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatters';
import { chartTheme } from './chart-theme';

interface WindChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
}

const WindChart: React.FC<WindChartProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartData, setChartData] = useState<
    Array<{
      name: string;
      distance: string;
      windSpeed: number;
      windGust: number;
      windDirection: number;
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
    if (forecastPoints.length === 0 || weatherData.length === 0) return;

    const data = forecastPoints.map((point, index) => {
      const weather = weatherData[index];
      return {
        name: formatTime(point.timestamp),
        distance: formatDistance(point.distance),
        windSpeed: weather?.windSpeed || 0,
        windGust: weather?.windGust || 0,
        windDirection: weather?.windDirection || 0,
        index: index,
        isSelected: index === selectedMarker,
      };
    });

    setChartData(data);
  }, [forecastPoints, weatherData, selectedMarker]);

  // Handle chart click
  const handleClick = (data: { activePayload?: Array<{ payload: { index: number } }> }) => {
    if (onChartClick && data?.activePayload?.[0]?.payload) {
      onChartClick(data.activePayload[0].payload.index);
    }
  };

  // Get theme colors
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;

  // Define wind speed categories
  const lightBreeze = 15; // km/h
  const moderateWind = 30; // km/h

  return (
    <ChartCard title="Wind" unitLabel="km/h">
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            onClick={handleClick}
          >
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
              domain={[0, 'auto']}
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

            {/* Reference lines for wind categories */}
            <ReferenceLine
              y={lightBreeze}
              stroke={theme.grid}
              strokeDasharray="3 3"
              label={{
                value: 'Light Breeze',
                position: 'insideBottomRight',
                fill: theme.text,
                fontSize: 10,
              }}
            />
            <ReferenceLine
              y={moderateWind}
              stroke={theme.grid}
              strokeDasharray="3 3"
              label={{
                value: 'Moderate Wind',
                position: 'insideBottomRight',
                fill: theme.text,
                fontSize: 10,
              }}
            />

            <Bar
              key="windSpeed-bar"
              dataKey="windSpeed"
              name="Wind Speed (km/h)"
              fill={`${theme.primary}80`}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line
              key="windGust-line"
              type="monotone"
              dataKey="windGust"
              name="Wind Gust (km/h)"
              stroke="#ff7300"
              strokeWidth={2}
              dot={(props: { cx: number; cy: number; payload: { isSelected: boolean } }) => {
                const { cx, cy, payload } = props;
                return payload.isSelected ? (
                  <circle
                    key={`dot-${cx}-${cy}-selected`}
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill="#ff7300"
                    stroke={theme.card}
                    strokeWidth={2}
                  />
                ) : (
                  <circle
                    key={`dot-${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="#ff7300"
                    opacity={0.8}
                  />
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default WindChart;
