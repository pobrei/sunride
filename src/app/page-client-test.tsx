'use client';

import { useRef, useState, useEffect } from 'react';
import { useWeather } from '@/context/WeatherContext';
import { useSimpleNotifications } from '@/components/providers/SimpleNotificationProvider';
import { GPXUploader, ThemeToggle } from '@/components/common';
import { SafeMapWrapper } from '@/components/map';
import { SafeTimelineWrapper } from '@/components/timeline';
import { SafeChartsWrapper } from '@/components/charts';
import { RouteControls, RouteSharing } from '@/components/route';
import { WeatherProviderComparison } from '@/components/weather';
import { LoadingSpinner, UserGuide, Alerts } from '@/components/ui';
import { PDFExport } from '@/components/export';
import type { GPXData, RouteSettings } from '@/types';

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
    loadingMessage
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
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
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
          <RouteControls
            onUpdateSettings={handleUpdateSettings}
            onExportPDF={() => {}}
            isGenerating={isGenerating}
            isExporting={false}
          />
          <WeatherProviderComparison />
          <RouteSharing />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
              <LoadingSpinner message={loadingMessage} centered />
            </div>
          ) : (
            <>
              <div ref={mapRef} className="rounded-lg overflow-hidden border border-border">
                <SafeMapWrapper
                  gpxData={gpxData}
                  forecastPoints={forecastPoints}
                  weatherData={weatherData}
                  onMarkerClick={handleMarkerClick}
                  selectedMarker={selectedMarker}
                />
              </div>

              {forecastPoints.length > 0 && weatherData.length > 0 && (
                <>
                  <div className="rounded-lg overflow-hidden border border-border">
          )}
        </div>
      </div>

      <UserGuide />
    </main>
  );
}
