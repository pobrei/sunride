'use client';

import { useRef } from 'react';
import { Map as MapIcon, Upload, CloudRain, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { layout } from '@/styles/tailwind-utils';
import gsap from 'gsap';

// Import from feature folders
import { useWeather } from '@/features/weather/context';
import { WeatherProviderComparison } from '@/features/weather/components';
import { RouteControls } from '@/features/route/components';
import { PDFExport } from '@/features/export/components';
import { KeyboardNavigation } from '@/features/navigation/components';
import { useNotifications } from '@/features/notifications/context';

// Import from components
import { EnhancedThemeToggle } from '@/components/ui/enhanced-theme-toggle';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ProgressSteps } from '@/components/ui/progress-steps';

// Import types
import type { GPXData, RouteSettings } from '@/types';

// Import UI components
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GPXUploader } from '@/features/gpx/components';

// Import layout components
import { Header } from '@/components/layout/header';

// Import the map component
import MapWrapper from '@/components/map/MapWrapper';
import { ClientSideTimeline } from '@/components/timeline/ClientSideTimeline';
import { WeatherAlerts } from '@/components/weather/WeatherAlerts';
import { TripSummary as RouteSummary } from '@/components/route/TripSummary';
import { UserGuide } from '@/components/help/UserGuide';

// Import charts
import ClientSideCharts from '@/components/charts/ClientSideCharts';

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
    console.log('handleUpdateSettings called with:', settings);
    // Use the generateWeatherForecast function from context
    try {
      await generateWeatherForecast(
        settings.weatherInterval,
        settings.startTime,
        settings.avgSpeed
      );
      console.log('Weather forecast generated successfully');
    } catch (error) {
      console.error('Error generating weather forecast:', error);
      addNotification('error', 'Failed to generate weather forecast');
    }
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
      icon: <Upload className="h-3 w-3" />,
    },
    {
      label: 'Process Route',
      description: 'Extract route data from GPX',
      status: gpxData ? 'complete' : 'pending',
      icon: <MapIcon className="h-3 w-3" />,
    },
    {
      label: 'Get Weather',
      description: 'Fetch weather data for route points',
      status: isGenerating ? 'in-progress' : weatherData.length > 0 ? 'complete' : 'pending',
      icon: <CloudRain className="h-3 w-3" />,
    },
    {
      label: 'Visualize',
      description: 'Display route with weather data',
      status: forecastPoints.length > 0 && weatherData.length > 0 ? 'complete' : 'pending',
      icon: <BarChart className="h-3 w-3" />,
    },
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
      <RouteControls onUpdateSettings={handleUpdateSettings} isGenerating={isGenerating} />
      <WeatherProviderComparison forecastPoints={forecastPoints} />
    </div>
  );

  // Create header content with breadcrumb and progress steps
  const headerContent = (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <Breadcrumb
          segments={[
            { label: 'Home', href: '/' },
            { label: 'Route Planner', href: '#' },
          ]}
        />
        <div className="flex items-center space-x-2">
          <EnhancedThemeToggle />
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="SunRide" />

      <div className="container mx-auto px-4 sm:px-6 py-8 pb-24">
        {' '}
        {/* Improved responsive padding */}
        {headerContent}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mt-8 animate-fade-in">
          {/* Left panel with controls */}
          <div className="lg:col-span-1 space-y-6 order-2 lg:order-1 animate-slide-in-left">
            {sidebarContent}
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3 space-y-8 order-1 lg:order-2 animate-slide-in-right">
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px] sm:h-[450px] md:h-[500px] bg-card rounded-lg border border-border shadow-sm animate-scale-up">
                <LoadingSpinner
                  message={loadingMessage || 'Loading weather data...'}
                  centered
                  variant="train"
                  withContainer
                  size="lg"
                />
              </div>
            ) : (
              <>
                <div className="relative" ref={mapRef}>
                  <div className="h-[400px] sm:h-[450px] md:h-[500px] rounded-lg overflow-hidden border border-border shadow-sm animate-scale-up">
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
                      onSelectMarker={index => index !== null && handleMarkerClick(index)}
                      markerCount={forecastPoints.length}
                    />
                  )}
                </div>

                {forecastPoints.length > 0 && weatherData.length > 0 && (
                  <div className={cn('space-y-6 sm:space-y-8 mt-6 sm:mt-8 animate-slide-up')}>
                    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8')}>
                      <RouteSummary
                        gpxData={gpxData}
                        forecastPoints={forecastPoints}
                        weatherData={weatherData}
                        className="animate-fade-in stagger-item rounded-lg shadow-sm hover:shadow-md transition-all duration-300 card-hover-effect"
                      />

                      <WeatherAlerts
                        forecastPoints={forecastPoints}
                        weatherData={weatherData}
                        maxInitialAlerts={3}
                        compact={true}
                        className="animate-fade-in stagger-item rounded-lg shadow-sm hover:shadow-md transition-all duration-300 card-hover-effect"
                      />
                    </div>

                    <ClientSideTimeline
                      forecastPoints={forecastPoints}
                      weatherData={weatherData}
                      selectedMarker={selectedMarker}
                      onTimelineClick={handleTimelineClick}
                      height="h-[400px] sm:h-[450px] md:h-[480px] lg:h-[500px]"
                      showNavigation={true}
                    />

                    <div
                      ref={chartsRef}
                      className="mb-8 sm:mb-10 md:mb-12 w-full max-w-full overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-border bg-card p-4 sm:p-5 animate-fade-in stagger-item card-hover-effect"
                    >
                      {' '}
                      {/* Responsive bottom margin with full width */}
                      <ClientSideCharts
                        gpxData={gpxData}
                        forecastPoints={forecastPoints}
                        weatherData={weatherData}
                        selectedMarker={selectedMarker}
                        onChartClick={handleChartClick}
                        height="h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px]"
                      />
                    </div>
                  </div>
                )}

                <div className={cn('mt-6 sm:mt-8')}>
                  <UserGuide
                    className={cn(
                      'animate-fade-in stagger-item rounded-lg shadow-sm hover:shadow-md transition-all duration-300 card-hover-effect'
                    )}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
