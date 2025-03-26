'use client';

import { useState, useRef, useEffect } from 'react';
import { generateForecastPoints } from '@/utils/gpxParser';
import { fetchWeatherForPoints } from '@/lib/mongodb-api';
import GPXUploader from '@/components/GPXUploader';
import Map from '@/components/Map';
import Charts from '@/components/Charts';
import Timeline from '@/components/Timeline';
import Alerts from '@/components/Alerts';
import RouteControls, { RouteSettings } from '@/components/RouteControls';
import PDFExport from '@/components/PDFExport';
import type { GPXData } from '@/utils/gpxParser';
import type { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import gsap from 'gsap';
import { AlertCircle, X, Clock, Info, CheckCircle } from 'lucide-react';

// Toast notification component
const Toast = ({ type, message, onDismiss }: { type: 'error' | 'info' | 'success', message: string, onDismiss: () => void }) => {
  useEffect(() => {
    // Auto-dismiss success and info toasts after 5 seconds
    if (type !== 'error') {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [onDismiss, type]);
  
  const bgColor = type === 'error' ? 'bg-red-500/10 border-red-500' :
                 type === 'success' ? 'bg-green-500/10 border-green-500' :
                 'bg-blue-500/10 border-blue-500';
                 
  const iconColor = type === 'error' ? 'text-red-500' :
                  type === 'success' ? 'text-green-500' :
                  'text-blue-500';
  
  const Icon = type === 'error' ? AlertCircle :
              type === 'success' ? CheckCircle :
              Info;
  
  return (
    <div className={`mb-6 ${bgColor} border rounded-lg p-4 flex items-start animate-in fade-in slide-in-from-top-5`}>
      <Icon className={`h-5 w-5 ${iconColor} mt-0.5 mr-2 flex-shrink-0`} />
      <div className="flex-1">
        <p className={`${iconColor} font-medium`}>
          {type === 'error' ? 'Error: ' : type === 'success' ? 'Success: ' : 'Info: '}
          {message}
        </p>
        {type === 'error' && (
          <p className="text-muted-foreground text-sm mt-1">
            There was a problem retrieving weather data. This might be due to API limit restrictions or connection issues.
          </p>
        )}
      </div>
      <button 
        onClick={onDismiss}
        className="p-1 hover:bg-background rounded-full"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  );
};

// Loading spinner component
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-2 text-muted-foreground animate-pulse">
    <Clock className="animate-spin h-5 w-5" />
    <span>{message}</span>
  </div>
);

export default function Home() {
  // State variables
  const [gpxData, setGpxData] = useState<GPXData | null>(null);
  const [forecastPoints, setForecastPoints] = useState<ForecastPoint[]>([]);
  const [weatherData, setWeatherData] = useState<(WeatherData | null)[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, type: 'error' | 'info' | 'success', message: string}[]>([]);
  const [loadingState, setLoadingState] = useState<{isLoading: boolean, message: string}>({
    isLoading: false,
    message: ''
  });
  
  // Refs for PDF export
  const mapRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  
  // Get the PDF export utility
  const { generatePDF } = PDFExport({
    gpxData,
    forecastPoints,
    weatherData,
    mapRef: mapRef as React.RefObject<HTMLDivElement>,
    chartsRef: chartsRef as React.RefObject<HTMLDivElement>
  });
  
  // Add a notification
  const addNotification = (type: 'error' | 'info' | 'success', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    return id;
  };
  
  // Remove a notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Handle GPX file upload
  const handleGPXLoaded = (data: GPXData) => {
    setGpxData(data);
    setForecastPoints([]);
    setWeatherData([]);
    setSelectedMarker(null);
    setNotifications([]);
    
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
    if (!gpxData) {
      addNotification('error', 'Please upload a GPX file first');
      return;
    }
    
    setIsGenerating(true);
    setWeatherData([]);
    setForecastPoints([]);
    setSelectedMarker(null);
    setNotifications([]);
    setLoadingState({
      isLoading: true,
      message: 'Generating forecast points...'
    });
    
    try {
      // Generate forecast points at intervals along the route
      const points = generateForecastPoints(
        gpxData,
        settings.weatherInterval,
        settings.startTime,
        settings.avgSpeed
      );
      
      setForecastPoints(points);
      setLoadingState({
        isLoading: true,
        message: `Fetching weather data for ${points.length} points...`
      });
      
      // Fetch weather data for each point using client API
      try {
        const data = await fetchWeatherForPoints(points);
        
        // Check if we got data back
        const hasValidData = data.some(item => item !== null);
        if (!hasValidData) {
          throw new Error('Failed to fetch weather data. Please try again later.');
        }
        
        setWeatherData(data);
        addNotification('success', 'Weather forecast generated successfully');
        
        // Wait for component to render before animating
        setTimeout(() => {
          const chartsContainer = document.querySelector('.charts-container');
          if (chartsContainer) {
            gsap.fromTo(
              '.charts-container',
              { y: 50, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.2 }
            );
          }
        }, 0);
      } catch (error) {
        // Handle network or API errors
        let errorMessage = 'Failed to fetch weather data';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        addNotification('error', errorMessage);
        console.error('Error fetching weather data:', error);
      }
    } catch (error) {
      // Handle GPX processing errors
      let errorMessage = 'Failed to process route data';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      addNotification('error', errorMessage);
      console.error('Error processing route:', error);
    } finally {
      setIsGenerating(false);
      setLoadingState({
        isLoading: false,
        message: ''
      });
    }
  };
  
  // Handle marker click on map
  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index);
  };
  
  // Handle timeline item click
  const handleTimelineClick = (index: number) => {
    setSelectedMarker(index);
  };
  
  // Handle chart click
  const handleChartClick = (index: number) => {
    setSelectedMarker(index);
  };
  
  // Handle PDF export
  const handleExportPDF = async () => {
    if (!gpxData || weatherData.length === 0) {
      addNotification('error', 'No weather data available for export');
      return;
    }
    
    setIsExporting(true);
    setLoadingState({
      isLoading: true,
      message: 'Generating PDF...'
    });
    
    try {
      const success = await generatePDF();
      if (!success) {
        throw new Error('Failed to generate PDF');
      }
      
      addNotification('success', 'PDF exported successfully');
    } catch (error) {
      let errorMessage = 'Failed to export PDF';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      addNotification('error', errorMessage);
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
      setLoadingState({
        isLoading: false,
        message: ''
      });
    }
  };
  
  // Title click to reload the app
  const handleTitleClick = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="mb-6">
        <h1 
          className="text-3xl font-bold text-primary cursor-pointer hover:opacity-90 transition-colors"
          onClick={handleTitleClick}
        >
          RideWeather Planner
        </h1>
        <p className="text-muted-foreground mt-1">
          Plan your route with real-time weather forecasting
        </p>
      </header>
      
      <main className="max-w-7xl mx-auto">
        {/* Notification area */}
        {notifications.map(notification => (
          <Toast
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onDismiss={() => removeNotification(notification.id)}
          />
        ))}
        
        {/* Loading state indicator */}
        {loadingState.isLoading && (
          <div className="mb-6">
            <LoadingSpinner message={loadingState.message} />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <GPXUploader onGPXLoaded={handleGPXLoaded} isLoading={isGenerating} />
          </div>
          
          <div>
            <RouteControls
              onUpdateSettings={handleUpdateSettings}
              onExportPDF={handleExportPDF}
              isGenerating={isGenerating}
              isExporting={isExporting}
            />
          </div>
        </div>
        
        {gpxData && (
          <div className="map-container" ref={mapRef}>
            <Map
              gpxData={gpxData}
              forecastPoints={forecastPoints}
              weatherData={weatherData}
              onMarkerClick={handleMarkerClick}
              selectedMarker={selectedMarker}
            />
          </div>
        )}
        
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
            
            <div className="charts-container mt-6" ref={chartsRef}>
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
      </main>
      
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>RideWeather Planner &copy; {new Date().getFullYear()} | Data from OpenWeather API</p>
      </footer>
    </div>
  );
}
