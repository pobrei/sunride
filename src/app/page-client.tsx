'use client';

import { useRef } from 'react';
import { useWeather } from '@/context/WeatherContext';
import { useNotifications } from '@/components/NotificationProvider';
import GPXUploader from '@/components/GPXUploader';
import Map from '@/components/Map';
import Charts from '@/components/Charts';
import Timeline from '@/components/Timeline';
import Alerts from '@/components/Alerts';
import RouteControls, { RouteSettings } from '@/components/RouteControls';
import PDFExport from '@/components/PDFExport';
import type { GPXData } from '@/utils/gpxParser';
import { Clock } from 'lucide-react';
import WeatherProviderComparison from '@/components/WeatherProviderComparison';
import RouteSharing from '@/components/RouteSharing';
import UserGuide from '@/components/UserGuide';
import ThemeToggle from '@/components/ThemeToggle';
import gsap from 'gsap';

// Loading spinner component
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-2 text-muted-foreground animate-pulse">
    <Clock className="animate-spin h-5 w-5" />
    <span>{message}</span>
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
    loadingMessage
  } = useWeather();

  const { addNotification } = useNotifications();

  // Refs for PDF export
  const mapRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  // PDF export component props
  const pdfExportProps = {
    gpxData,
    forecastPoints,
    weatherData,
    mapRef: mapRef as React.RefObject<HTMLDivElement>,
    chartsRef: chartsRef as React.RefObject<HTMLDivElement>
  };

  // Handle GPX file upload
  const handleGPXLoaded = (data: GPXData) => {
    setGpxData(data);
    setSelectedMarker(null);

    // Show success notification
    addNotification('success', `Route loaded successfully: ${data.name || 'Unnamed route'} (${data.points.length} points)`);

    // Wait for component to render before animating
    setTimeout(() => {
      const mapContainer = document.querySelector('.map-container');
      if (mapContainer) {
        gsap.fromTo(
          '.map-container',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
      }
    }, 0);
  };

  // Handle route settings update
  const handleUpdateSettings = async (settings: RouteSettings) => {
    // Use the generateWeatherForecast function from context
    await generateWeatherForecast(
      settings.weatherInterval,
      settings.startTime,
      settings.avgSpeed
    );
  };

  // Handle marker click on map
  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index);
  };

  // Handle timeline click
  const handleTimelineClick = (index: number) => {
    setSelectedMarker(index);
  };

  // Handle chart click
  const handleChartClick = (index: number) => {
    setSelectedMarker(index);
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
              <LoadingSpinner message={loadingMessage} />
            </div>
          ) : (
            <>
              <div ref={mapRef}>
                <Map
                  gpxData={gpxData}
                  forecastPoints={forecastPoints}
                  weatherData={weatherData}
                  onMarkerClick={handleMarkerClick}
                  selectedMarker={selectedMarker}
                />
              </div>

              {forecastPoints.length > 0 && weatherData.length > 0 && (
                <>
                  <Timeline
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                    selectedMarker={selectedMarker}
                    onTimelineClick={handleTimelineClick}
                  />

                  <Alerts
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                  />

                  <div ref={chartsRef}>
                    <Charts
                      gpxData={gpxData}
                      forecastPoints={forecastPoints}
                      weatherData={weatherData}
                      selectedMarker={selectedMarker}
                      onChartClick={handleChartClick}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <UserGuide />
    </main>
  );
}
