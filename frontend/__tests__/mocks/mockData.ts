/**
 * Mock data for testing
 */

import { GPXData, ForecastPoint, WeatherData } from '@shared/types';

/**
 * Mock GPX data
 */
export const mockGPXData: GPXData = {
  name: 'Test Route',
  points: [
    { lat: 40.712776, lon: -74.005974, ele: 10, time: new Date('2023-01-01T10:00:00Z') },
    { lat: 40.713776, lon: -74.006974, ele: 15, time: new Date('2023-01-01T10:05:00Z') },
    { lat: 40.714776, lon: -74.007974, ele: 20, time: new Date('2023-01-01T10:10:00Z') },
    { lat: 40.715776, lon: -74.008974, ele: 25, time: new Date('2023-01-01T10:15:00Z') },
    { lat: 40.716776, lon: -74.009974, ele: 30, time: new Date('2023-01-01T10:20:00Z') },
  ],
  totalDistance: 10,
  elevationGain: 20,
  elevationLoss: 0,
  maxElevation: 30,
  minElevation: 10,
};

/**
 * Mock forecast points
 */
export const mockForecastPoints: ForecastPoint[] = [
  { lat: 40.712776, lon: -74.005974, distance: 0, elevation: 10, timestamp: 1672567200 },
  { lat: 40.713776, lon: -74.006974, distance: 2.5, elevation: 15, timestamp: 1672567500 },
  { lat: 40.714776, lon: -74.007974, distance: 5, elevation: 20, timestamp: 1672567800 },
  { lat: 40.715776, lon: -74.008974, distance: 7.5, elevation: 25, timestamp: 1672568100 },
  { lat: 40.716776, lon: -74.009974, distance: 10, elevation: 30, timestamp: 1672568400 },
];

/**
 * Mock weather data
 */
export const mockWeatherData: WeatherData[] = [
  {
    temperature: 20,
    feelsLike: 22,
    humidity: 65,
    pressure: 1013,
    windSpeed: 5,
    windDirection: 180,
    precipitation: 0,
    weatherIcon: '01d',
    weatherDescription: 'Clear sky',
    uvIndex: 5,
    windGust: 7,
    precipitationProbability: 0,
  },
  {
    temperature: 21,
    feelsLike: 23,
    humidity: 64,
    pressure: 1012,
    windSpeed: 6,
    windDirection: 185,
    precipitation: 0,
    weatherIcon: '01d',
    weatherDescription: 'Clear sky',
    uvIndex: 6,
    windGust: 8,
    precipitationProbability: 0,
  },
  {
    temperature: 22,
    feelsLike: 24,
    humidity: 63,
    pressure: 1011,
    windSpeed: 7,
    windDirection: 190,
    precipitation: 0,
    weatherIcon: '01d',
    weatherDescription: 'Clear sky',
    uvIndex: 7,
    windGust: 9,
    precipitationProbability: 0,
  },
  {
    temperature: 23,
    feelsLike: 25,
    humidity: 62,
    pressure: 1010,
    windSpeed: 8,
    windDirection: 195,
    precipitation: 0,
    weatherIcon: '01d',
    weatherDescription: 'Clear sky',
    uvIndex: 8,
    windGust: 10,
    precipitationProbability: 0,
  },
  {
    temperature: 24,
    feelsLike: 26,
    humidity: 61,
    pressure: 1009,
    windSpeed: 9,
    windDirection: 200,
    precipitation: 0,
    weatherIcon: '01d',
    weatherDescription: 'Clear sky',
    uvIndex: 9,
    windGust: 11,
    precipitationProbability: 0,
  },
];

/**
 * Mock GPX file content
 */
export const mockGPXFileContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Test App">
  <metadata>
    <name>Test Route</name>
  </metadata>
  <trk>
    <name>Test Route</name>
    <trkseg>
      <trkpt lat="40.712776" lon="-74.005974">
        <ele>10</ele>
        <time>2023-01-01T10:00:00Z</time>
      </trkpt>
      <trkpt lat="40.713776" lon="-74.006974">
        <ele>15</ele>
        <time>2023-01-01T10:05:00Z</time>
      </trkpt>
      <trkpt lat="40.714776" lon="-74.007974">
        <ele>20</ele>
        <time>2023-01-01T10:10:00Z</time>
      </trkpt>
      <trkpt lat="40.715776" lon="-74.008974">
        <ele>25</ele>
        <time>2023-01-01T10:15:00Z</time>
      </trkpt>
      <trkpt lat="40.716776" lon="-74.009974">
        <ele>30</ele>
        <time>2023-01-01T10:20:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;
