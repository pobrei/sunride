'use client';

import { useState, useEffect } from 'react';
import { useThemeDetection } from './useThemeDetection';

/**
 * A hook that provides chart colors based on the current theme
 * @returns An object with chart colors for the current theme
 */
export function useChartTheme() {
  const { isDarkMode } = useThemeDetection();
  // Get CSS variables for chart colors
  const getCSSVariable = (name: string, fallback: string): string => {
    if (typeof window === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  };

  // Function to get current chart colors based on theme
  const getChartColors = () => {
    // Get CSS variables for chart colors
    const getColor = (variable: string, opacity: number = 1) => {
      const color = getCSSVariable(`--${variable}`, '#00C2A8');
      return opacity < 1 ? `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : color;
    };

    return {
      backgroundColor: isDarkMode ? 'rgba(28, 31, 36, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      textColor: isDarkMode ? getCSSVariable('--color-foreground', '#F5F7FA') : getCSSVariable('--color-foreground', '#1E2A38'),
      gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',

      // Chart-specific colors using CSS variables
      temperature: {
        bg: `${getCSSVariable('--chart-temperature-color', '#FFB6C1')}4D`, // 4D = 30% opacity
        border: getCSSVariable('--chart-temperature-color', '#FFB6C1'),
        point: getCSSVariable('--chart-temperature-color', '#FFB6C1'),
      },
      feelsLike: {
        bg: `${getCSSVariable('--chart-feels-like-color', '#98FB98')}4D`,
        border: getCSSVariable('--chart-feels-like-color', '#98FB98'),
        point: getCSSVariable('--chart-feels-like-color', '#98FB98'),
      },
      humidity: {
        bg: `${getCSSVariable('--chart-humidity-color', '#87CEF9')}4D`,
        border: getCSSVariable('--chart-humidity-color', '#87CEF9'),
        point: getCSSVariable('--chart-humidity-color', '#87CEF9'),
      },
      pressure: {
        bg: `${getCSSVariable('--chart-pressure-color', '#9370DB')}4D`,
        border: getCSSVariable('--chart-pressure-color', '#9370DB'),
        point: getCSSVariable('--chart-pressure-color', '#9370DB'),
      },
      uvIndex: {
        bg: `${getCSSVariable('--chart-uv-color', '#FFA500')}4D`,
        border: getCSSVariable('--chart-uv-color', '#FFA500'),
        point: getCSSVariable('--chart-uv-color', '#FFA500'),
      },
      precipitation: {
        bg: `${getCSSVariable('--chart-precipitation-color', '#4682B4')}4D`,
        border: getCSSVariable('--chart-precipitation-color', '#4682B4'),
        point: getCSSVariable('--chart-precipitation-color', '#4682B4'),
      },
      wind: {
        bg: `${getCSSVariable('--chart-wind-color', '#6495ED')}4D`,
        border: getCSSVariable('--chart-wind-color', '#6495ED'),
        point: getCSSVariable('--chart-wind-color', '#6495ED'),
      },
      elevation: {
        bg: `${getCSSVariable('--chart-elevation-color', '#A0522D')}4D`,
        border: getCSSVariable('--chart-elevation-color', '#A0522D'),
        point: getCSSVariable('--chart-elevation-color', '#A0522D'),
      },
    };
  };

  // Get current chart colors
  const chartColors = getChartColors();

  // Helper function to get tooltip options
  const getTooltipOptions = () => {
    return {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: getCSSVariable('--chart-tooltip-bg', isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'),
      titleColor: getCSSVariable('--chart-tooltip-text', isDarkMode ? '#111' : '#fff'),
      bodyColor: getCSSVariable('--chart-tooltip-text', isDarkMode ? '#333' : '#fff'),
      borderColor: isDarkMode ? 'rgba(200, 200, 200, 0.8)' : 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 6,
      titleFont: {
        weight: 'bold' as const,
        size: 14,
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      bodyFont: {
        size: 12,
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      caretSize: 8,
      displayColors: true,
    };
  };

  // Helper function to get grid line options
  const getGridLineOptions = () => {
    return {
      color: getCSSVariable('--chart-grid-color', isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
      lineWidth: 1,
      display: true,
      drawBorder: true,
      drawOnChartArea: true,
      drawTicks: true,
    };
  };

  return {
    chartColors,
    getTooltipOptions,
    getGridLineOptions,
    isDarkMode,
  };
}
