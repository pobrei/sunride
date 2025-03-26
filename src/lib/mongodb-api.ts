'use client';

// Client-side API wrapper for MongoDB operations
import { ForecastPoint, WeatherData } from './weatherAPI';

// Max retry attempts for API calls
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch weather data through our API instead of direct MongoDB access
export async function fetchWeatherForPoints(points: ForecastPoint[]): Promise<(WeatherData | null)[]> {
  let retries = 0;
  
  // Define retry logic in a separate function
  const fetchWithRetry = async (): Promise<(WeatherData | null)[]> => {
    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `Server responded with status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Validate the returned data structure
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid data structure received from server');
      }
      
      return result.data;
    } catch (error) {
      // If we haven't hit max retries yet, try again
      if (retries < MAX_RETRIES) {
        retries++;
        console.log(`Retry ${retries}/${MAX_RETRIES} for weather data fetch`);
        await delay(RETRY_DELAY * retries); // Exponential backoff
        return fetchWithRetry();
      }
      
      // We've exhausted our retries, log and return null array
      console.error('Error fetching weather data after retries:', error);
      return points.map(() => null);
    }
  };
  
  return fetchWithRetry();
}

export async function fetchWeatherForPoint(point: ForecastPoint): Promise<WeatherData | null> {
  let retries = 0;
  
  // Define retry logic in a separate function
  const fetchWithRetry = async (): Promise<WeatherData | null> => {
    try {
      const params = new URLSearchParams({
        lat: point.lat.toString(),
        lon: point.lon.toString(),
        timestamp: point.timestamp.toString(),
        distance: point.distance.toString()
      });
      
      const response = await fetch(`/api/weather?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `Server responded with status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Validate the returned data
      if (!result.data) {
        throw new Error('Invalid data structure received from server');
      }
      
      return result.data;
    } catch (error) {
      // If we haven't hit max retries yet, try again
      if (retries < MAX_RETRIES) {
        retries++;
        console.log(`Retry ${retries}/${MAX_RETRIES} for weather data fetch`);
        await delay(RETRY_DELAY * retries); // Exponential backoff
        return fetchWithRetry();
      }
      
      // We've exhausted our retries, log and return null
      console.error('Error fetching weather data after retries:', error);
      return null;
    }
  };
  
  return fetchWithRetry();
} 