'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import BaseChart from './BaseChart';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatUtils';
import { chartTheme } from './chart-theme';
import '@/styles/chart-styles.css';

interface UVIndexChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
}

// Function to get UV index color based on value and risk level
const getUVColor = (value: number, isDarkMode: boolean) => {
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;

  // Return different colors based on UV index value
  if (value <= 2) return theme.uvLow;        // Low (0-2)
  if (value <= 5) return theme.uvModerate;   // Moderate (3-5)
  if (value <= 7) return theme.uvHigh;       // High (6-7)
  if (value <= 10) return theme.uvVeryHigh;  // Very High (8-10)
  return theme.uvExtreme;                    // Extreme (11+)
};

// Function to get UV risk level
const getUVRiskLevel = (value: number) => {
  if (value <= 2) return 'Low';
  if (value <= 5) return 'Moderate';
  if (value <= 7) return 'High';
  if (value <= 10) return 'Very High';
  return 'Extreme';
};

const UVIndexChart: React.FC<UVIndexChartProps> = ({
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
      uvIndex: number;
      riskLevel: string;
      color: string;
      index: number;
      isSelected: boolean;
      timestamp: number;
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
      const uvIndex = weather?.uvIndex || 0;

      return {
        name: formatTime(point.timestamp),
        distance: formatDistance(point.distance * 1000), // Convert km to meters before formatting
        uvIndex: uvIndex,
        riskLevel: getUVRiskLevel(uvIndex),
        color: getUVColor(uvIndex, isDarkMode),
        index: index,
        isSelected: index === selectedMarker,
        timestamp: point.timestamp,
      };
    });

    setChartData(data);
  }, [forecastPoints, weatherData, selectedMarker, isDarkMode]);

  // Handle chart click
  const handleClick = (data: { activePayload?: Array<{ payload: { index: number } }> }) => {
    if (onChartClick && data?.activePayload?.[0]?.payload) {
      onChartClick(data.activePayload[0].payload.index);
    }
  };

  // Get theme colors
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: { distance: string; uvIndex: number; riskLevel: string; color: string };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">{label}</p>
          <p className="chart-tooltip-label">{data.distance}</p>
          <div className="flex items-center mt-2">
            {data.riskLevel === 'Low' && <div className="w-3 h-3 mr-2 bg-[var(--chart-uv-low)]" />}
            {data.riskLevel === 'Moderate' && <div className="w-3 h-3 mr-2 bg-[var(--chart-uv-moderate)]" />}
            {data.riskLevel === 'High' && <div className="w-3 h-3 mr-2 bg-[var(--chart-uv-high)]" />}
            {data.riskLevel === 'Very High' && <div className="w-3 h-3 mr-2 bg-[var(--chart-uv-very-high)]" />}
            {data.riskLevel === 'Extreme' && <div className="w-3 h-3 mr-2 bg-[var(--chart-uv-extreme)]" />}
            {data.riskLevel === 'Low' && <p className="uv-value uv-low-text">UV Index: {data.uvIndex} ({data.riskLevel})</p>}
            {data.riskLevel === 'Moderate' && <p className="uv-value uv-moderate-text">UV Index: {data.uvIndex} ({data.riskLevel})</p>}
            {data.riskLevel === 'High' && <p className="uv-value uv-high-text">UV Index: {data.uvIndex} ({data.riskLevel})</p>}
            {data.riskLevel === 'Very High' && <p className="uv-value uv-very-high-text">UV Index: {data.uvIndex} ({data.riskLevel})</p>}
            {data.riskLevel === 'Extreme' && <p className="uv-value uv-extreme-text">UV Index: {data.uvIndex} ({data.riskLevel})</p>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <BaseChart title="UV Index" unitLabel="" forecastPoints={forecastPoints} weatherData={weatherData} selectedMarker={selectedMarker} onChartClick={onChartClick}>
      <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
            onClick={handleClick}
          >
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke={theme.text}
              fontSize={12}
              fontWeight="500"
              tickLine={true}
              axisLine={{ stroke: theme.grid, strokeWidth: 1.5 }}
              dy={15}
            />
            <YAxis
              stroke={theme.text}
              fontSize={12}
              fontWeight="500"
              tickLine={false}
              axisLine={{ stroke: theme.grid, strokeWidth: 1.5 }}
              dx={-10}
              domain={[0, 12]}
              ticks={[0, 2, 5, 7, 10, 12]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: theme.text }}
              content={({ payload }) => (
                <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1 rounded-sm bg-[var(--chart-uv-low)]"></div>
                    <span className="text-xs">Low (0-2)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1 rounded-sm bg-[var(--chart-uv-moderate)]"></div>
                    <span className="text-xs">Moderate (3-5)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1 rounded-sm bg-[var(--chart-uv-high)]"></div>
                    <span className="text-xs">High (6-7)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1 rounded-sm bg-[var(--chart-uv-very-high)]"></div>
                    <span className="text-xs">Very High (8-10)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1 rounded-sm bg-[var(--chart-uv-extreme)]"></div>
                    <span className="text-xs">Extreme (11+)</span>
                  </div>
                </div>
              )}
            />

            {/* Reference lines for UV categories */}
            <ReferenceLine y={2} stroke={theme.grid} strokeDasharray="3 3" />
            <ReferenceLine y={5} stroke={theme.grid} strokeDasharray="3 3" />
            <ReferenceLine y={7} stroke={theme.grid} strokeDasharray="3 3" />
            <ReferenceLine y={10} stroke={theme.grid} strokeDasharray="3 3" />

            <Bar dataKey="uvIndex" name="UV Index" barSize={20}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={entry.isSelected ? theme.card : 'none'}
                  strokeWidth={entry.isSelected ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
    </BaseChart>
  );
};

export default UVIndexChart;
