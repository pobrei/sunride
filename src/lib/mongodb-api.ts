'use client';

// Client-side API wrapper for MongoDB operations
import { ForecastPoint, WeatherData } from './weatherAPI';

// Fetch weather data through our API instead of direct MongoDB access
export async function fetchWeatherForPoints(points: ForecastPoint[]): Promise<(WeatherData | null)[]> {
  try {
    const response = await fetch('/api/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return points.map(() => null);
  }
}

export async function fetchWeatherForPoint(point: ForecastPoint): Promise<WeatherData | null> {
  try {
    const params = new URLSearchParams({
      lat: point.lat.toString(),
      lon: point.lon.toString(),
      timestamp: point.timestamp.toString(),
      distance: point.distance.toString()
    });
    
    const response = await fetch(`/api/weather?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
} 