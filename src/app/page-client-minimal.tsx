'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { useSimpleNotifications } from '@/components/providers/SimpleNotificationProvider';
import { GPXUploader, ThemeToggle } from '@/components/common';
import { PDFExport } from '@/components/export';
import { LoadingSpinner, UserGuide } from '@/components/ui';
import type { GPXData } from '@/types';

export default function Home() {
  const {
    gpxData,
    setGpxData,
    generateWeatherForecast,
    isLoading,
    isGenerating,
    loadingMessage
  } = useWeather();

  const { addNotification } = useSimpleNotifications();

  // Handle GPX file upload
  const handleGPXLoaded = (data: GPXData) => {
    setGpxData(data);

    // Generate weather forecast
    generateWeatherForecast(data.points);

    // Show notification
    addNotification('success', 'GPX file loaded successfully');
  };

  // Handle route settings update is implemented in the full version

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
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
              <LoadingSpinner message={loadingMessage} centered />
            </div>
          ) : (
            <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
              <p>Map will be displayed here</p>
            </div>
          )}
        </div>
      </div>

      <UserGuide />
    </main>
  );
}
