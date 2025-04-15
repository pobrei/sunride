import { ForecastPoint, WeatherData } from '@frontend/features/weather/types';

// Debug flag
const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Fetch weather data for a list of forecast points
 * This is a client-side mock version for the enhanced visualization demo
 */
export async function fetchWeatherData(
  points: ForecastPoint[]
): Promise<(WeatherData | null)[]> {
  try {
    log(`Fetching mock weather data for ${points.length} points`);

    // For demo purposes, generate mock weather data
    const results = points.map(point => generateMockWeatherData(point));

    return results;
  } catch (error) {
    console.error('Error generating mock weather data:', error);
    return points.map(() => null);
  }
}

/**
 * Generate mock weather data for a forecast point
 */
function generateMockWeatherData(point: ForecastPoint): WeatherData {
  // Use the point's coordinates and timestamp to generate somewhat realistic data
  const date = new Date(point.timestamp * 1000);
  const hour = date.getHours();

  // Base temperature varies by time of day (cooler at night, warmer during day)
  let baseTemp = 15; // Base temperature in Celsius

  if (hour >= 6 && hour < 12) {
    // Morning: gradually warming up
    baseTemp += (hour - 6) * 1.5;
  } else if (hour >= 12 && hour < 18) {
    // Afternoon: warmest part of day
    baseTemp += 9 + (hour - 12) * 0.5;
  } else if (hour >= 18 && hour < 24) {
    // Evening: cooling down
    baseTemp += 11 - (hour - 18) * 1.5;
  } else {
    // Night: coolest part of day
    baseTemp += (hour + 6) * 0.5;
  }

  // Adjust temperature based on elevation (roughly -1°C per 100m)
  // We'll use the distance as a proxy for elevation in this mock
  const elevationEffect = (point.distance / 5) * -1;

  // Add some randomness
  const randomFactor = Math.random() * 4 - 2; // -2 to +2 degrees

  const temperature = baseTemp + elevationEffect + randomFactor;

  // Generate other weather parameters
  const feelsLike = temperature - Math.random() * 3; // Feels slightly cooler
  const humidity = 40 + Math.random() * 40; // 40-80%
  const pressure = 1000 + Math.random() * 30; // 1000-1030 hPa
  const windSpeed = 5 + Math.random() * 15; // 5-20 km/h
  const windDirection = Math.random() * 360; // 0-360 degrees

  // Precipitation is more likely in the afternoon
  let rain = 0;
  if (hour >= 12 && hour < 18 && Math.random() > 0.7) {
    rain = Math.random() * 5; // 0-5mm
  }

  // Weather icon and description
  let weatherIcon = '01d'; // Clear sky by default
  let weatherDescription = 'Clear sky';

  if (rain > 0) {
    if (rain < 2) {
      weatherIcon = '10d'; // Light rain
      weatherDescription = 'Light rain';
    } else {
      weatherIcon = '09d'; // Moderate rain
      weatherDescription = 'Moderate rain';
    }
  } else if (humidity > 70) {
    weatherIcon = '03d'; // Scattered clouds
    weatherDescription = 'Scattered clouds';
  } else if (Math.random() > 0.7) {
    weatherIcon = '02d'; // Few clouds
    weatherDescription = 'Few clouds';
  }

  // Convert day icons to night icons after sunset
  if (hour < 6 || hour >= 18) {
    weatherIcon = weatherIcon.replace('d', 'n');
  }

  // Ensure UV index is properly calculated based on time of day
  const uvIndex = Math.max(0, Math.min(11, Math.floor((6 - Math.abs(hour - 12)) * 1.5)));

  return {
    temperature,
    feelsLike,
    humidity,
    pressure,
    windSpeed,
    windDirection,
    rain,
    weatherIcon,
    weatherDescription,
    uvIndex: uvIndex, // 0-11, peaks at noon
    windGust: windSpeed + Math.random() * 10,
    precipitationProbability: rain > 0 ? 0.5 + Math.random() * 0.5 : Math.random() * 0.3,
    precipitation: rain, // Same as rain for mock data
    snow: 0, // No snow in mock data
  };
}

// Logger function that respects DEBUG flag
function log(...args: unknown[]) {
  if (DEBUG) {
    console.log('[MockWeatherAPI]', ...args);
  }
}
