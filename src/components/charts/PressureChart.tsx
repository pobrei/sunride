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
  Legend
} from 'recharts';
import ChartCard from './ChartCard';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatters';
import { chartTheme } from './chart-theme';

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
  const [chartData, setChartData] = useState<any[]>([]);
  
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
        pressure: weather?.pressure || 1013, // Default sea level pressure
        index: index,
        isSelected: index === selectedMarker,
      };
    });
    
    setChartData(data);
  }, [forecastPoints, weatherData, selectedMarker]);
  
  // Handle chart click
  const handleClick = (data: any) => {
    if (onChartClick && data?.activePayload?.[0]?.payload) {
      onChartClick(data.activePayload[0].payload.index);
    }
  };
  
  // Get theme colors
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;
  
  // Calculate min and max pressure for better visualization
  const pressureValues = chartData.map(d => d.pressure).filter(p => p > 0);
  const minPressure = pressureValues.length > 0 
    ? Math.floor(Math.min(...pressureValues) - 2) 
    : 1000;
  const maxPressure = pressureValues.length > 0 
    ? Math.ceil(Math.max(...pressureValues) + 2) 
    : 1030;
  
  return (
    <ChartCard title="Pressure" unitLabel="hPa">
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            onClick={handleClick}
          >
            <CartesianGrid 
              stroke={theme.grid} 
              strokeDasharray="3 3" 
              vertical={false} 
            />
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
              domain={[minPressure, maxPressure]}
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
            <Line
              type="monotone"
              dataKey="pressure"
              name="Pressure (hPa)"
              stroke="#9333ea"
              strokeWidth={2}
              activeDot={{ 
                r: 8, 
                stroke: theme.card, 
                strokeWidth: 2,
                fill: "#9333ea" 
              }}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                return payload.isSelected ? (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={6} 
                    fill="#9333ea" 
                    stroke={theme.card}
                    strokeWidth={2}
                  />
                ) : (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={4} 
                    fill="#9333ea" 
                    opacity={0.8}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default PressureChart;
