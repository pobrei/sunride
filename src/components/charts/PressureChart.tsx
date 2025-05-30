'use client';

import React, { useEffect, useState } from 'react';
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
} from 'recharts';
import BaseChart from './BaseChart';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatUtils';
import { chartTheme } from './chart-theme';
import '@/styles/chart-styles.css';

interface PressureChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
}

const PressureChart: React.FC<PressureChartProps> = ({
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
      pressure: number;
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
      return {
        name: formatTime(point.timestamp),
        distance: formatDistance(point.distance * 1000), // Convert km to meters before formatting
        pressure: weather?.pressure || 1013, // Default sea level pressure
        index: index,
        isSelected: index === selectedMarker,
        timestamp: point.timestamp,
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

  // Custom tooltip formatter
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { distance: string; pressure: number } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // Determine pressure category
      const getPressureCategory = (pressure: number) => {
        if (pressure < 1000) return 'Low (cyclonic)';
        if (pressure > 1020) return 'High (anticyclonic)';
        return 'Normal';
      };

      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">{label}</p>
          <p className="chart-tooltip-label">Distance: {data.distance}</p>
          <p className="pressure-value">Pressure: {data.pressure} hPa</p>
          <p className="chart-tooltip-label">{getPressureCategory(data.pressure)}</p>
        </div>
      );
    }
    return null;
  };

  // Get theme colors
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;

  // Calculate min and max pressure for better visualization
  const pressureValues = chartData.map(d => d.pressure).filter(p => p > 0);
  const minPressure =
    pressureValues.length > 0 ? Math.floor(Math.min(...pressureValues) - 2) : 1000;
  const maxPressure = pressureValues.length > 0 ? Math.ceil(Math.max(...pressureValues) + 2) : 1030;

  // Standard sea level pressure
  const standardPressure = 1013.25; // hPa

  return (
    <BaseChart title="Pressure" unitLabel="hPa" forecastPoints={forecastPoints} weatherData={weatherData} selectedMarker={selectedMarker} onChartClick={onChartClick}>
      <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
              domain={[minPressure, maxPressure]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Reference line for standard sea level pressure */}
            <ReferenceLine
              y={standardPressure}
              stroke="#64748b"
              strokeDasharray="3 3"
              label={{
                value: 'Standard (1013.25)',
                position: 'insideBottomRight',
                fill: theme.text,
                fontSize: 10,
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: theme.text }}
            />
            <Line
              key="pressure-line"
              type="monotone"
              dataKey="pressure"
              name="Pressure (hPa)"
              stroke={theme.pressure}
              strokeWidth={2}
              activeDot={{
                r: 8,
                stroke: theme.card,
                strokeWidth: 2,
                fill: theme.pressure,
              }}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
    </BaseChart>
  );
};

export default PressureChart;
