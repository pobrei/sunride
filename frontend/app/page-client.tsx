'use client';

import { useRef } from 'react';
import { Clock, Map as MapIcon, Upload, CloudRain, BarChart } from 'lucide-react';
import gsap from 'gsap';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import from context and components
import { useWeather } from '@frontend/context/WeatherContext';
import { WeatherProviderComparison } from '@frontend/components/WeatherProviderComparison';
import { GPXUploader as FeatureGPXUploader } from '@frontend/components/GPXUploader';
import { Map } from '@frontend/components/Map';
import { RouteControls } from '@frontend/components/RouteControls';
import { PDFExport } from '@frontend/components/PDFExport';
import { ChartContainer } from '@frontend/components/charts/Charts';
import { Timeline } from '@frontend/components/timeline/Timeline';
import { useNotifications } from '@frontend/components/providers';
import { KeyboardNavigation } from '@frontend/components/KeyboardNavigation';

// Import from components
import { ThemeToggle } from '@frontend/components/ui/theme-toggle';
import { Button } from '@frontend/components/ui/button';
import { Card } from '@frontend/components/ui/card';
import { Breadcrumb } from '@frontend/components/ui/breadcrumb';
import { ProgressSteps } from '@frontend/components/ui/progress-steps';

// Import types
import type { GPXData, RouteSettings } from '@shared/types';

// Import UI components
import { LoadingSpinner } from '@frontend/components/ui/LoadingSpinner';
import { ErrorMessage } from '@frontend/components/ui/ErrorMessage';
import GPXUploader from '@frontend/components/GPXUploader';

// Import layout components
import { ResponsiveLayout } from '@frontend/components/layout/responsive-layout';

// Import the map component
import MapWrapper from '@frontend/components/map/MapWrapper';
import { ClientSideTimeline } from '@frontend/components/timeline/ClientSideTimeline';
import { ClientSideCharts } from '@frontend/components/charts/ClientSideCharts';
import { WeatherAlerts } from '@frontend/components/weather/WeatherAlerts';
import { TripSummary as RouteSummary } from '@frontend/components/route/TripSummary';
import { UserGuide } from '@frontend/components/help/UserGuide';
import { cn } from '@shared/lib/utils';

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
    chartsRef: chartsRef as React.RefObject<HTMLDivElement>,
  };

  // Handle GPX file upload
  const handleGPXLoaded = (data: GPXData) => {
    setGpxData(data);
    setSelectedMarker(null);

    // Show success notification
    addNotification(
      'success',
      `Route loaded successfully: ${data.name || 'Unnamed route'} (${data.points.length} points)`
    );

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
    await generateWeatherForecast(settings.weatherInterval, settings.startTime, settings.avgSpeed);
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

  // Define the processing steps for GPX upload
  const uploadSteps = [
    {
      label: 'Upload GPX',
      description: 'Select and upload a GPX file',
      status: gpxData ? 'complete' : 'pending',
      icon: <Upload className="h-3 w-3" />
    },
    {
      label: 'Process Route',
      description: 'Extract route data from GPX',
      status: gpxData ? 'complete' : 'pending',
      icon: <MapIcon className="h-3 w-3" />
    },
    {
      label: 'Get Weather',
      description: 'Fetch weather data for route points',
      status: isGenerating ? 'in-progress' : (weatherData.length > 0 ? 'complete' : 'pending'),
      icon: <CloudRain className="h-3 w-3" />
    },
    {
      label: 'Visualize',
      description: 'Display route with weather data',
      status: (forecastPoints.length > 0 && weatherData.length > 0) ? 'complete' : 'pending',
      icon: <BarChart className="h-3 w-3" />
    }
  ];

  // Determine the active step
  const getActiveStep = () => {
    if (!gpxData) return 0;
    if (gpxData && !weatherData.length) return 1;
    if (isGenerating) return 2;
    if (forecastPoints.length > 0 && weatherData.length > 0) return 3;
    return 0;
  };

  // Create sidebar content
  const sidebarContent = (
    <div className="space-y-4">
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
  );

  // Create header content with breadcrumb and progress steps
  const headerContent = (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <Breadcrumb
          segments={[
            { label: 'Home', href: '/' },
            { label: 'Route Planner', href: '#' }
          ]}
        />
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <PDFExport {...pdfExportProps} />
        </div>
      </div>

      {gpxData && (
        <ProgressSteps
          steps={uploadSteps}
          activeStep={getActiveStep()}
          showStepNumbers={false}
          showDescriptions={true}
          className="mt-2"
        />
      )}
    </div>
  );

  return (
    <ResponsiveLayout
      sidebarContent={sidebarContent}
      headerContent={headerContent}
      sidebarTitle="Route Controls"
      sidebarIcon={<MapIcon className="h-5 w-5 text-primary" />}
      sidebarCollapsible={true}
      sidebarDefaultCollapsed={false}
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[500px] bg-muted/30 rounded-lg border border-border">
            <LoadingSpinner
              message={loadingMessage || 'Loading weather data...'}
              centered
              variant="spinner"
              withContainer
              size="lg"
            />
          </div>
        ) : (
          <>
            <div ref={mapRef} className="relative">
              <div className="h-[500px] rounded-lg overflow-hidden border border-border">
                <MapWrapper
                  gpxData={gpxData}
                  forecastPoints={forecastPoints}
                  weatherData={weatherData}
                  onMarkerClick={handleMarkerClick}
                  selectedMarker={selectedMarker}
                />
              </div>

              {forecastPoints.length > 0 && (
                <KeyboardNavigation
                  onNavigate={direction => console.log(`Navigate ${direction}`)}
                  onZoom={direction => console.log(`Zoom ${direction}`)}
                  onSelectMarker={handleMarkerClick}
                  markerCount={forecastPoints.length}
                />
              )}
            </div>

            {forecastPoints.length > 0 && weatherData.length > 0 && (
              <div className="space-y-6">
                <RouteSummary
                  gpxData={gpxData}
                  forecastPoints={forecastPoints}
                  weatherData={weatherData}
                  className="fade-in"
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
                  className="fade-in"
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
              </div>
            )}
          </>
        )}

        <UserGuide className="fade-in" />

        {/* Enhanced Visualization Demo Link */}
        <Card className="p-6 border border-border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Enhanced Data Visualization Demo</h3>
              <p className="text-muted-foreground">
                Check out our enhanced map and chart visualizations with interactive features
              </p>
            </div>
            <Button asChild>
              <Link href="/enhanced-visualization">
                <BarChart className="mr-2 h-4 w-4" />
                View Demo
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}
