'use client';

import { useRef, useMemo } from 'react';
import { useWeather } from '@/context/WeatherContext';
import { useNotifications } from '@/components/NotificationProvider';
import { usePDFExport } from '@/hooks/usePDFExport';
import { useGPXHandler } from '@/hooks/useGPXHandler';
import { useRouteSettings } from '@/hooks/useRouteSettings';
import GPXUploader from '@/components/GPXUploader';
import SafeMapWrapper from '@/components/SafeMapWrapper';
import SafeChartsWrapper from '@/components/SafeChartsWrapper';
import SafeTimelineWrapper from '@/components/SafeTimelineWrapper';
import Alerts from '@/components/Alerts';
import RouteControls from '@/components/RouteControls';
import PDFExport from '@/components/PDFExport';
// No need to import types that are only used in custom hooks
import WeatherProviderComparison from '@/components/WeatherProviderComparison';
import UserGuide from '@/components/UserGuide';
import ThemeToggle from '@/components/ThemeToggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import gsap from 'gsap';

/**
 * Main application component
 */
export default function Home() {
  // Get weather context state and actions
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

  const { addNotification } = useNotifications();

  // Refs for PDF export
  const mapRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  /**
   * Use the PDF export hook
   */
  const { isExporting, exportPDF } = usePDFExport({
    gpxData,
    forecastPoints,
    weatherData
  });

  /**
   * Memoized PDF export props to prevent unnecessary re-renders
   */
  const pdfExportProps = useMemo(() => ({
    gpxData,
    forecastPoints,
    weatherData,
    mapRef: mapRef as React.RefObject<HTMLDivElement>,
    chartsRef: chartsRef as React.RefObject<HTMLDivElement>
  }), [gpxData, forecastPoints, weatherData]);

  /**
   * Use custom hooks for different functionalities
   */
  const { handleGPXLoaded, handleMarkerSelect } = useGPXHandler();
  const { updateSettings } = useRouteSettings();

  /**
   * Check if weather data is available to display
   */
  const hasWeatherData = forecastPoints.length > 0 && weatherData.length > 0;

  return (
    <main className="container mx-auto px-6 py-8 max-w-7xl bg-[#f9fafb] dark:bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-foreground text-gradient">
          RideWeather Planner
        </h1>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <PDFExport {...pdfExportProps} />
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <GPXUploader
            onGPXLoaded={handleGPXLoaded}
            isLoading={isGenerating}
          />
          <RouteControls
            onUpdateSettings={updateSettings}
            onExportPDF={exportPDF}
            isGenerating={isGenerating}
            isExporting={isExporting}
          />
          <WeatherProviderComparison />
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-xl border border-border/50 card-shadow-sm">
              <LoadingSpinner message={loadingMessage} />
            </div>
          ) : (
            <>
              {/* Map */}
              <div ref={mapRef}>
                <SafeMapWrapper
                  gpxData={gpxData}
                  forecastPoints={forecastPoints}
                  weatherData={weatherData}
                  onMarkerClick={handleMarkerSelect}
                  selectedMarker={selectedMarker}
                />
              </div>

              {/* Weather data visualizations */}
              {hasWeatherData && (
                <>
                  <SafeTimelineWrapper
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                    selectedMarker={selectedMarker}
                    onTimelineClick={handleMarkerSelect}
                  />

                  <Alerts
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                  />

                  <div ref={chartsRef}>
                    <SafeChartsWrapper
                      gpxData={gpxData}
                      forecastPoints={forecastPoints}
                      weatherData={weatherData}
                      selectedMarker={selectedMarker}
                      onChartClick={handleMarkerSelect}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* User guide */}
      <UserGuide />
    </main>
  );
}
