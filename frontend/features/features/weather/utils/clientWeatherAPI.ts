import { ForecastPoint, WeatherData } from '@frontend/features/weather/types';

// Debug flag
const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Fetch weather data for a list of forecast points from the server API
 */
export async function fetchWeatherData(
  points: ForecastPoint[]
): Promise<(WeatherData | null)[]> {
  try {
    log(`Fetching weather data for ${points.length} points`);

    // Call our API endpoint
    const response = await fetch('/api/weather', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ points }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check if the response has the expected structure
    if (data && data.success && Array.isArray(data.data)) {
      log(`Received weather data for ${data.data.length} points`);
      return data.data;
    } else if (data && !data.success) {
      throw new Error(`API error: ${data.error || 'Unknown error'}`);
    } else {
      throw new Error('Invalid response format from weather API');
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return array of nulls with same length as points
    return points.map(() => null);
  }
}

// Logger function that respects DEBUG flag
function log(...args: unknown[]) {
  if (DEBUG) {
    console.log('[ClientWeatherAPI]', ...args);
  }
}
