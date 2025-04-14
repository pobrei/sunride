'use client';

import { useRef } from 'react';
import { Clock } from 'lucide-react';
import gsap from 'gsap';

// Import from feature folders
import { useWeather } from '@/features/weather/context';
import { WeatherProviderComparison, Alerts } from '@/features/weather/components';
import { GPXUploader as FeatureGPXUploader } from '@/features/gpx/components';
import { Map, SafeMapWrapper } from '@/features/map/components';
import { RouteControls, TripSummary } from '@/features/route/components';
import { PDFExport } from '@/features/export/components';
import { ChartContainer, SafeChartsWrapper } from '@/features/charts/components';
import { Timeline, SafeTimelineWrapper } from '@/features/timeline/components';
import { useNotifications } from '@/features/notifications/context';
import { useSafeData } from '@/features/data-validation/context';
import { UserGuide as FeatureUserGuide } from '@/features/help/components';
import { KeyboardNavigation } from '@/features/navigation/components';

// Import from components
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Import types
import type { GPXData, RouteSettings } from '@/types';

// Import UI components
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import GPXUploader from '@/components/GPXUploader';
import { ClientSideMap } from '@/components/map/ClientSideMap';
import { ClientSideTimeline } from '@/components/timeline/ClientSideTimeline';
import { ClientSideCharts } from '@/components/charts/ClientSideCharts';
import { WeatherAlerts } from '@/components/weather/WeatherAlerts';
import { TripSummary as RouteSummary } from '@/components/route/TripSummary';
import { UserGuide } from '@/components/help/UserGuide';
import { PageWrapper } from '@/components/layout/page-wrapper';

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
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">RideWeather Planner</h1>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <PDFExport {...pdfExportProps} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <GPXUploader
            onGPXLoaded={handleGPXLoaded}
            isLoading={isGenerating}
            showProgress={true}
            showSuccess={true}
            helpText="Upload a GPX file to visualize your route with detailed weather forecasts"
          />
          <RouteControls
            onUpdateSettings={handleUpdateSettings}
            onExportPDF={() => {}}
            isGenerating={isGenerating}
            isExporting={false}
          />
          <WeatherProviderComparison />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg border border-border">
              <LoadingSpinner
                message={loadingMessage || "Loading weather data..."}
                centered
                variant="spinner"
                withContainer
                size="lg"
              />
            </div>
          ) : (
            <>
              <div ref={mapRef} className="relative">
                <ClientSideMap
                  gpxData={gpxData}
                  forecastPoints={forecastPoints}
                  weatherData={weatherData}
                  onMarkerClick={handleMarkerClick}
                  selectedMarker={selectedMarker}
                  height="h-[400px]"
                  className="map-container"
                  showPlaceholder={true}
                />

                {forecastPoints.length > 0 && (
                  <KeyboardNavigation
                    onNavigate={(direction) => console.log(`Navigate ${direction}`)}
                    onZoom={(direction) => console.log(`Zoom ${direction}`)}
                    onSelectMarker={handleMarkerClick}
                    markerCount={forecastPoints.length}
                  />
                )}
              </div>

              {forecastPoints.length > 0 && weatherData.length > 0 && (
                <>
                  <RouteSummary
                    gpxData={gpxData}
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                    className="animate-fade-in"
                  />

                  <ClientSideTimeline
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                    selectedMarker={selectedMarker}
                    onTimelineClick={handleTimelineClick}
                    height="h-[150px]"
                    showNavigation={true}
                  />

                  <WeatherAlerts
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                    maxInitialAlerts={3}
                    compact={true}
                    className="animate-fade-in"
                  />

                  <div ref={chartsRef}>
                    <ClientSideCharts
                      gpxData={gpxData}
                      forecastPoints={forecastPoints}
                      weatherData={weatherData}
                      selectedMarker={selectedMarker}
                      onChartClick={handleChartClick}
                      height="h-[300px]"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <UserGuide className="animate-fade-in" />
    </PageWrapper>
  );
}
