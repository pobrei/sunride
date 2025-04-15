'use client';

import React, { useRef } from 'react';
import { useWeather } from '@frontend/context/WeatherContext';
import { useSimpleNotifications } from '@frontend/components/providers/SimpleNotificationProvider';
import { GPXUploader, ThemeToggle } from '@frontend/components/common';
import { PDFExport } from '@frontend/components/export';
import { LoadingSpinner, UserGuide } from '@frontend/components/ui';
import type { GPXData, RouteSettings } from '@shared/types';

// Simple placeholder component for the map
const MapPlaceholder = () => (
  <div className="h-[400px] bg-muted flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner message="Map component is disabled" centered />
      <p className="mt-2 text-sm text-muted-foreground">
        Map functionality is temporarily disabled to fix rendering issues
      </p>
    </div>
  </div>
);

// Simple placeholder component for the timeline
const TimelinePlaceholder = () => (
  <div className="h-[150px] bg-muted flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner message="Timeline component is disabled" centered />
      <p className="mt-2 text-sm text-muted-foreground">
        Timeline functionality is temporarily disabled to fix rendering issues
      </p>
    </div>
  </div>
);

// Simple placeholder component for the charts
const ChartsPlaceholder = () => (
  <div className="h-[300px] bg-muted flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner message="Charts component is disabled" centered />
      <p className="mt-2 text-sm text-muted-foreground">
        Charts functionality is temporarily disabled to fix rendering issues
      </p>
    </div>
  </div>
);

export default function Home() {
  const {
    gpxData,
    forecastPoints,
    weatherData,
    selectedMarker,
    setGpxData,
    setSelectedMarker,
    generateWeatherForecast,
    isLoading,
    isGenerating,
    loadingMessage,
  } = useWeather();

  const { addNotification } = useSimpleNotifications();

  // Refs for scrolling
  const mapRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  // Handle GPX file upload
  const handleGPXLoaded = (data: GPXData) => {
    setGpxData(data);

    // Generate weather forecast
    generateWeatherForecast(data.points);

    // Show notification
    addNotification('success', 'GPX file loaded successfully');
  };

  // Handle marker click
  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index);
    addNotification('info', `Selected marker at position ${index}`);
  };

  // Handle timeline click
  const handleTimelineClick = (index: number) => {
    setSelectedMarker(index);
    addNotification('info', `Selected timeline point at position ${index}`);
  };

  // Handle chart click
  const handleChartClick = (index: number) => {
    setSelectedMarker(index);
    addNotification('info', `Selected chart point at position ${index}`);
  };

  // Handle route settings update
  const handleUpdateSettings = (settings: RouteSettings) => {
    console.log('Route settings updated:', settings);
    addNotification('info', 'Route settings updated');
  };

  // PDF export props
  const pdfExportProps = {
    gpxData,
    isExporting: false,
    onExport: () => {
      addNotification('info', 'Exporting PDF...');
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">RideWeather Planner</h1>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <PDFExport {...pdfExportProps} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <GPXUploader onGPXLoaded={handleGPXLoaded} isLoading={isGenerating} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
              <LoadingSpinner message={loadingMessage} centered />
            </div>
          ) : (
            <div ref={mapRef} className="h-[400px] rounded-lg overflow-hidden border border-border">
              <MapPlaceholder />
            </div>
          )}

          {forecastPoints.length > 0 && weatherData.length > 0 && (
            <>
              <div className="rounded-lg overflow-hidden border border-border">
                <TimelinePlaceholder />
              </div>

              <div ref={chartsRef} className="rounded-lg overflow-hidden border border-border">
                <ChartsPlaceholder />
              </div>
            </>
          )}
        </div>
      </div>

      <UserGuide />
    </div>
  );
}
