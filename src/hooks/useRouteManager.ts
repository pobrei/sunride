'use client';

import { useRef, useCallback, useMemo } from 'react';
import gsap from 'gsap';

import { useWeather } from '@/features/weather/context';
import { useNotifications } from '@/features/notifications/context';
import type { GPXData, RouteSettings } from '@/types';

/**
 * Custom hook for managing route-related state and operations
 * Extracted from the main component for better separation of concerns
 */
export function useRouteManager() {
  const {
    gpxData,
    setGpxData,
    forecastPoints,
    setForecastPoints,
    weatherData,
    setWeatherData,
    selectedMarker,
    setSelectedMarker,
    isGenerating,
    setIsGenerating,
    error,
    setError,
  } = useWeather();

  const { addNotification } = useNotifications();

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoized handlers to prevent unnecessary re-renders
  const handleGPXUpload = useCallback((data: GPXData) => {
    setGpxData(data);
    
    // Animate container on upload
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }

    addNotification({
      type: 'success',
      title: 'GPX File Uploaded',
      message: `Successfully loaded route with ${data.points.length} points`,
    });
  }, [setGpxData, addNotification]);

  const handleRouteSettingsChange = useCallback((settings: RouteSettings) => {
    // Handle route settings changes
    console.log('Route settings changed:', settings);
  }, []);

  const handleChartClick = useCallback((index: number) => {
    setSelectedMarker(index);
  }, [setSelectedMarker]);

  // Define the processing steps for GPX upload - memoized to prevent unnecessary re-renders
  const uploadSteps = useMemo(() => [
    {
      label: 'Upload GPX',
      description: 'Select and upload a GPX file',
      status: gpxData ? 'complete' : 'pending',
      icon: 'upload',
    },
    {
      label: 'Process Route',
      description: 'Extract route data from GPX',
      status: gpxData ? 'complete' : 'pending',
      icon: 'map',
    },
    {
      label: 'Get Weather',
      description: 'Fetch weather data for route points',
      status: isGenerating ? 'in-progress' : weatherData.length > 0 ? 'complete' : 'pending',
      icon: 'cloud-rain',
    },
    {
      label: 'Visualize',
      description: 'Display route with weather data',
      status: forecastPoints.length > 0 && weatherData.length > 0 ? 'complete' : 'pending',
      icon: 'bar-chart',
    },
  ] as const, [gpxData, isGenerating, weatherData.length, forecastPoints.length]);

  // Determine the active step - memoized to prevent unnecessary re-renders
  const activeStep = useMemo(() => {
    if (!gpxData) return 0;
    if (isGenerating) return 2;
    if (weatherData.length > 0) return 3;
    return 1;
  }, [gpxData, isGenerating, weatherData.length]);

  return {
    // State
    gpxData,
    forecastPoints,
    weatherData,
    selectedMarker,
    isGenerating,
    error,
    uploadSteps,
    activeStep,
    
    // Handlers
    handleGPXUpload,
    handleRouteSettingsChange,
    handleChartClick,
    
    // Refs
    containerRef,
    
    // State setters (for direct access if needed)
    setGpxData,
    setForecastPoints,
    setWeatherData,
    setSelectedMarker,
    setIsGenerating,
    setError,
  };
}
