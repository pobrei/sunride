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
import { AlertCircle, X } from 'lucide-react';

export default function Home() {
  // State variables
  const [gpxData, setGpxData] = useState<GPXData | null>(null);
  const [forecastPoints, setForecastPoints] = useState<ForecastPoint[]>([]);
  const [weatherData, setWeatherData] = useState<(WeatherData | null)[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
  
  // Handle GPX file upload
  const handleGPXLoaded = (data: GPXData) => {
    setGpxData(data);
    setForecastPoints([]);
    setWeatherData([]);
    setSelectedMarker(null);
    setErrorMessage(null);
    
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
    if (!gpxData) return;
    
    setIsGenerating(true);
    setWeatherData([]);
    setForecastPoints([]);
    setSelectedMarker(null);
    setErrorMessage(null);
    
    try {
      // Generate forecast points at intervals along the route
      const points = generateForecastPoints(
        gpxData,
        settings.weatherInterval,
        settings.startTime,
        settings.avgSpeed
      );
      
      setForecastPoints(points);
      
      // Fetch weather data for each point using client API
      const data = await fetchWeatherForPoints(points);
      
      // Check if we got data back
      const hasValidData = data.some(item => item !== null);
      if (!hasValidData) {
        throw new Error('Failed to fetch weather data. Please try again later.');
      }
      
      setWeatherData(data);
      
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
      console.error('Error generating forecast:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate weather forecast');
    } finally {
      setIsGenerating(false);
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
    if (!gpxData || weatherData.length === 0) return;
    
    setIsExporting(true);
    setErrorMessage(null);
    
    try {
      const success = await generatePDF();
      if (!success) {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to export PDF');
    } finally {
      setIsExporting(false);
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
        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-500 font-medium">Error: {errorMessage}</p>
              <p className="text-muted-foreground text-sm mt-1">
                There was a problem retrieving weather data. This might be due to API limit restrictions or connection issues.
              </p>
            </div>
            <button 
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-background rounded-full"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
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
