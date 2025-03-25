'use client';

import { useState, useRef, useEffect } from 'react';
import { getMultipleForecastPoints } from '@/lib/weatherAPI';
import { generateForecastPoints } from '@/utils/gpxParser';
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
import { fetchWeatherForPoints } from '@/lib/mongodb-api';

export default function Home() {
  // State variables
  const [gpxData, setGpxData] = useState<GPXData | null>(null);
  const [forecastPoints, setForecastPoints] = useState<ForecastPoint[]>([]);
  const [weatherData, setWeatherData] = useState<(WeatherData | null)[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
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
    
    // Animate the appearance of the map section
    gsap.fromTo(
      '.map-container',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  };
  
  // Handle route settings update
  const handleUpdateSettings = async (settings: RouteSettings) => {
    if (!gpxData) return;
    
    setIsGenerating(true);
    setWeatherData([]);
    setForecastPoints([]);
    setSelectedMarker(null);
    
    try {
      // Generate forecast points at intervals along the route
      const points = generateForecastPoints(
        gpxData,
        settings.weatherInterval,
        settings.startTime,
        settings.avgSpeed
      );
      
      setForecastPoints(points);
      
      // Fetch weather data for each point
      const data = await fetchWeatherForPoints(points);
      setWeatherData(data);
      
      // Animate the appearance of charts and timeline
      gsap.fromTo(
        '.charts-container',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.2 }
      );
    } catch (error) {
      console.error('Error generating forecast:', error);
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
    
    try {
      const success = await generatePDF();
      if (!success) {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Title click to reload the app
  const handleTitleClick = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#121214] text-white p-6">
      <header className="mb-6">
        <h1 
          className="text-3xl font-bold text-orange-500 cursor-pointer hover:text-orange-400 transition-colors"
          onClick={handleTitleClick}
        >
          RideWeather Planner
        </h1>
        <p className="text-neutral-400 mt-1">
          Plan your route with real-time weather forecasting
        </p>
      </header>
      
      <main className="max-w-7xl mx-auto">
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
      
      <footer className="mt-12 text-center text-neutral-500 text-sm">
        <p>RideWeather Planner &copy; {new Date().getFullYear()} | Data from OpenWeather API</p>
      </footer>
    </div>
  );
}
