'use client';

// Client-side API wrapper for MongoDB operations
import { ForecastPoint, WeatherData } from './weatherAPI';

// Max retry attempts for API calls
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Custom error types for better error handling
export class APIError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Validate forecast points
function validateForecastPoints(points: ForecastPoint[]): void {
  if (!points || !Array.isArray(points) || points.length === 0) {
    throw new ValidationError('No forecast points provided');
  }
  
  for (const point of points) {
    if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number' ||
        typeof point.timestamp !== 'number' || typeof point.distance !== 'number') {
      throw new ValidationError('Invalid point data. Each point must have lat, lon, timestamp, and distance as numbers.');
    }
    
    if (point.lat < -90 || point.lat > 90 || point.lon < -180 || point.lon > 180) {
      throw new ValidationError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
    }
  }
}

// Fetch weather data through our API instead of direct MongoDB access
export async function fetchWeatherForPoints(points: ForecastPoint[]): Promise<(WeatherData | null)[]> {
  let retries = 0;
  
  // Process progress
  const progress = {
    total: points.length,
    processed: 0,
    status: 'pending'
  };
  
  try {
    // Validate input
    validateForecastPoints(points);
    
    // Define retry logic in a separate function
    const fetchWithRetry = async (): Promise<(WeatherData | null)[]> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          let errorMessage: string;
          
          try {
            const errorData = await response.json();
            errorMessage = errorData?.error || `Server responded with status: ${response.status}`;
          } catch {
            errorMessage = `API error: ${response.status} ${response.statusText}`;
          }
          
          throw new APIError(errorMessage, response.status);
        }
        
        const result = await response.json();
        
        // Validate the returned data structure
        if (!result.data || !Array.isArray(result.data)) {
          throw new ValidationError('Invalid data structure received from server');
        }
        
        progress.processed = result.data.length;
        progress.status = 'completed';
        
        return result.data;
      } catch (error: unknown) {
        // Handle abort errors (timeouts)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new NetworkError('Request timed out. The server took too long to respond.');
        }
        
        // If we haven't hit max retries yet, try again
        if (retries < MAX_RETRIES) {
          retries++;
          console.log(`Retry ${retries}/${MAX_RETRIES} for weather data fetch`);
          progress.status = `retrying (${retries}/${MAX_RETRIES})`;
          
          await delay(RETRY_DELAY * retries); // Exponential backoff
          return fetchWithRetry();
        }
        
        // We've exhausted our retries, propagate the error
        progress.status = 'failed';
        throw error;
      }
    };
    
    // Execute the fetch with retry logic
    return await fetchWithRetry();
  } catch (error: unknown) {
    // Format the error message based on error type
    let errorMessage: string;
    
    if (error instanceof ValidationError) {
      errorMessage = `Validation error: ${error.message}`;
      console.error(errorMessage);
    } else if (error instanceof NetworkError) {
      errorMessage = `Network error: ${error.message}`;
      console.error(errorMessage);
    } else if (error instanceof APIError) {
      errorMessage = `API error (${error.status}): ${error.message}`;
      console.error(errorMessage);
    } else if (error instanceof Error) {
      errorMessage = `Error fetching weather data: ${error.message}`;
      console.error('Error fetching weather data:', error);
    } else {
      errorMessage = 'An unknown error occurred while fetching weather data';
      console.error('Unknown error:', error);
    }
    
    // Throw a descriptive error
    throw new Error(errorMessage);
  }
}

export async function fetchWeatherForPoint(point: ForecastPoint): Promise<WeatherData | null> {
  let retries = 0;
  
  try {
    // Validate input
    validateForecastPoints([point]);
    
    // Define retry logic in a separate function
    const fetchWithRetry = async (): Promise<WeatherData | null> => {
      try {
        const params = new URLSearchParams({
          lat: point.lat.toString(),
          lon: point.lon.toString(),
          timestamp: point.timestamp.toString(),
          distance: point.distance.toString()
        });
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`/api/weather?${params}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          let errorMessage: string;
          
          try {
            const errorData = await response.json();
            errorMessage = errorData?.error || `Server responded with status: ${response.status}`;
          } catch {
            errorMessage = `API error: ${response.status} ${response.statusText}`;
          }
          
          throw new APIError(errorMessage, response.status);
        }
        
        const result = await response.json();
        
        // Validate the returned data
        if (!result.data) {
          throw new ValidationError('Invalid data structure received from server');
        }
        
        return result.data;
      } catch (error: unknown) {
        // Handle abort errors (timeouts)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new NetworkError('Request timed out. The server took too long to respond.');
        }
        
        // If we haven't hit max retries yet, try again
        if (retries < MAX_RETRIES) {
          retries++;
          console.log(`Retry ${retries}/${MAX_RETRIES} for weather data fetch`);
          await delay(RETRY_DELAY * retries); // Exponential backoff
          return fetchWithRetry();
        }
        
        // We've exhausted our retries, propagate the error
        throw error;
      }
    };
    
    return await fetchWithRetry();
  } catch (error: unknown) {
    // Format the error message based on error type
    let errorMessage: string;
    
    if (error instanceof ValidationError) {
      errorMessage = `Validation error: ${error.message}`;
    } else if (error instanceof NetworkError) {
      errorMessage = `Network error: ${error.message}`;
    } else if (error instanceof APIError) {
      errorMessage = `API error (${error.status}): ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = `Error fetching weather data: ${error.message}`;
    } else {
      errorMessage = 'An unknown error occurred while fetching weather data';
    }
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}