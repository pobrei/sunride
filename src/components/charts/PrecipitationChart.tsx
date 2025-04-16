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
} from 'recharts';
import ChartCard from './ChartCard';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatters';
import { chartTheme } from './chart-theme';

interface PrecipitationChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
}

const PrecipitationChart: React.FC<PrecipitationChartProps> = ({
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
      precipitation: number;
      probability: number;
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
        precipitation: weather?.precipitation || 0,
        probability: weather?.precipitationProbability || 0,
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

  return (
    <ChartCard title="Precipitation" unitLabel="mm / %">
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
              yAxisId="left"
              stroke={theme.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              dx={-10}
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={theme.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              domain={[0, 100]}
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
            <Bar
              key="precipitation-bar"
              yAxisId="left"
              dataKey="precipitation"
              name="Precipitation (mm)"
              fill={`${theme.primary}80`}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line
              key="probability-line"
              yAxisId="right"
              type="monotone"
              dataKey="probability"
              name="Probability (%)"
              stroke="#8884d8"
              dot={(props: { cx: number; cy: number; payload: { isSelected: boolean } }) => {
                const { cx, cy, payload } = props;
                return payload.isSelected ? (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill="#8884d8"
                    stroke={theme.card}
                    strokeWidth={2}
                  />
                ) : (
                  <circle cx={cx} cy={cy} r={4} fill="#8884d8" opacity={0.8} />
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default PrecipitationChart;
