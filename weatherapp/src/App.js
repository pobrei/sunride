import React, { useState } from 'react';
import Map from './components/Map';
import List from './components/List';
import Charts from './components/Charts';
import { createRateLimiter, checkRateLimit } from './lib/rateLimiter';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [rateLimiter] = useState(createRateLimiter());
  
  // Enhanced location data with descriptions
  const locations = [
    { 
      id: 1, 
      title: 'San Francisco', 
      description: 'Famous for the Golden Gate Bridge and cable cars.',
      position: { lat: 37.7749, lng: -122.4194 } 
    },
    { 
      id: 2, 
      title: 'Los Angeles', 
      description: 'Home to Hollywood and beautiful beaches.',
      position: { lat: 34.0522, lng: -118.2437 } 
    },
    { 
      id: 3, 
      title: 'San Diego', 
      description: 'Known for its perfect climate and beaches.',
      position: { lat: 32.7157, lng: -117.1611 } 
    },
    { 
      id: 4, 
      title: 'Sacramento', 
      description: 'The capital city of California.',
      position: { lat: 38.5816, lng: -121.4944 } 
    }
  ];
  
  // Mock GPX data for demonstration - matched to location IDs
  const mockGpxData = {
    points: locations.map(loc => ({ 
      lat: loc.position.lat, 
      lon: loc.position.lng, 
      elevation: 10 + Math.random() * 20, 
      distance: (loc.id - 1) * 5 
    }))
  };
  
  // Mock forecast points based directly on locations
  const forecastPoints = locations.map(loc => ({
    id: loc.id,
    lat: loc.position.lat, 
    lon: loc.position.lng,
    timestamp: new Date(`2025-04-01T${10 + loc.id}:00:00`),
    distance: (loc.id - 1) * 10
  }));
  
  // Mock weather data - directly matched to location indices
  const weatherData = [
    { temperature: 18, feelsLike: 17, rain: 0, windSpeed: 5, windDirection: 90, humidity: 65, pressure: 1013 },
    { temperature: 22, feelsLike: 24, rain: 0, windSpeed: 8, windDirection: 180, humidity: 55, pressure: 1012 },
    { temperature: 20, feelsLike: 19, rain: 0.5, windSpeed: 12, windDirection: 270, humidity: 70, pressure: 1010 },
    { temperature: 16, feelsLike: 14, rain: 2, windSpeed: 15, windDirection: 0, humidity: 80, pressure: 1008 }
  ];

  // Handle item selection from the List component
  const handleItemClick = async (item) => {
    try {
      await checkRateLimit(rateLimiter);
      setSelectedItem(item);
      console.log(`Selected item from list: ${item.title}`);
    } catch (error) {
      console.error('Rate limit exceeded:', error);
      alert('Too many requests. Please try again later.');
    }
  };

  // Handle marker selection from the Map component
  const handleMarkerClick = async (marker) => {
    try {
      await checkRateLimit(rateLimiter);
      setSelectedItem(marker);
      console.log(`Selected marker from map: ${marker.title}`);
    } catch (error) {
      console.error('Rate limit exceeded:', error);
      alert('Too many requests. Please try again later.');
    }
  };
  
  // Handle chart point selection - using index to find the location
  const handleChartClick = async (index) => {
    try {
      await checkRateLimit(rateLimiter);
      // Make sure index is valid
      if (index >= 0 && index < locations.length) {
        const item = locations[index];
        console.log(`Chart clicked! Setting selected item to:`, item);
        setSelectedItem(item);
      } else {
        console.warn(`Invalid chart index: ${index}`);
      }
    } catch (error) {
      console.error('Rate limit exceeded:', error);
      alert('Too many requests. Please try again later.');
    }
  };

  // Get the selected marker index for the charts
  const getSelectedMarkerIndex = () => {
    if (!selectedItem) return null;
    // Return the index of the location in the array
    const index = locations.findIndex(item => item.id === selectedItem.id);
    console.log(`Selected marker index for charts: ${index}`);
    return index;
  };

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ padding: '15px', margin: 0, backgroundColor: '#4CAF50', color: 'white', textAlign: 'center' }}>
          RideWeather Planner
        </h1>
        
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left sidebar - List */}
          <div style={{ width: '300px', overflowY: 'auto', padding: '10px', borderRight: '1px solid #e0e0e0' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Locations</h2>
            <List 
              items={locations} 
              selectedItem={selectedItem} 
              onItemClick={handleItemClick} 
            />
          </div>
          
          {/* Main content - Map */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Map
                center={selectedItem ? selectedItem.position : { lat: 37.7749, lng: -122.4194 }}
                zoom={10}
                markers={locations}
                selectedItem={selectedItem}
                onMarkerClick={handleMarkerClick}
              />
            </div>
            
            {/* Charts section - bottom of screen */}
            <div style={{ height: '300px', padding: '10px', borderTop: '1px solid #e0e0e0', backgroundColor: '#f9f9f9', overflow: 'auto' }}>
              <Charts 
                gpxData={mockGpxData}
                forecastPoints={forecastPoints}
                weatherData={weatherData}
                selectedMarker={getSelectedMarkerIndex()}
                onChartClick={handleChartClick}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
