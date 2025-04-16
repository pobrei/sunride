'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';

export default function TestPage() {
  const {
    gpxData,
    forecastPoints,
    weatherData,
    selectedMarker,
    isLoading,
    isGenerating,
    error,
    loadingMessage,
  } = useWeather();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page (Using Context)</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">GPX Data</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {gpxData ? JSON.stringify(gpxData, null, 2) : 'No GPX data'}
          </pre>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Forecast Points</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {forecastPoints.length > 0 ? JSON.stringify(forecastPoints.slice(0, 2), null, 2) : 'No forecast points'}
          </pre>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Weather Data</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {weatherData.length > 0 ? JSON.stringify(weatherData.slice(0, 2), null, 2) : 'No weather data'}
          </pre>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Selected Marker</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {selectedMarker !== null ? selectedMarker : 'No selected marker'}
          </pre>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Loading State</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {isLoading ? 'Loading' : 'Not loading'}
          </pre>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Generating State</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {isGenerating ? 'Generating' : 'Not generating'}
          </pre>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Error</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {error ? error.message : 'No error'}
          </pre>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Loading Message</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {loadingMessage || 'No loading message'}
          </pre>
        </div>
      </div>
    </div>
  );
}
