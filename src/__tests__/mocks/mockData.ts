import { GPXData, RoutePoint } from '@/features/gpx/utils/gpxParser';
import { ForecastPoint, WeatherData } from '@/features/weather/types';

/**
 * Mock GPX data for testing
 */
export const mockGPXData: GPXData = {
  name: 'Test Route',
  points: [
    {
      lat: 47.6062,
      lon: -122.3321,
      elevation: 100,
      time: new Date('2023-01-01T12:00:00Z'),
      distance: 0,
    },
    {
      lat: 47.6063,
      lon: -122.3322,
      elevation: 110,
      time: new Date('2023-01-01T12:05:00Z'),
      distance: 0.75,
    },
    {
      lat: 47.6064,
      lon: -122.3323,
      elevation: 120,
      time: new Date('2023-01-01T12:10:00Z'),
      distance: 1.5,
    },
  ],
  totalDistance: 1.5,
  elevationGain: 20,
  elevationLoss: 0,
  maxElevation: 120,
  minElevation: 100,
};

/**
 * Mock forecast points for testing
 */
export const mockForecastPoints: ForecastPoint[] = [
  {
    lat: 47.6062,
    lon: -122.3321,
    timestamp: Math.floor(new Date('2023-01-01T12:00:00Z').getTime() / 1000),
    distance: 0,
  },
  {
    lat: 47.6063,
    lon: -122.3322,
    timestamp: Math.floor(new Date('2023-01-01T12:05:00Z').getTime() / 1000),
    distance: 0.75,
  },
  {
    lat: 47.6064,
    lon: -122.3323,
    timestamp: Math.floor(new Date('2023-01-01T12:10:00Z').getTime() / 1000),
    distance: 1.5,
  },
];

/**
 * Mock weather data for testing
 */
export const mockWeatherData: WeatherData[] = [
  {
    temperature: 20,
    feelsLike: 22,
    humidity: 65,
    pressure: 1013,
    windSpeed: 5,
    windDirection: 180,
    rain: 0,
    weatherIcon: '01d',
    weatherDescription: 'Clear sky',
    uvIndex: 5,
    windGust: 7,
    precipitationProbability: 0,
  },
  {
    temperature: 21,
    feelsLike: 23,
    humidity: 63,
    pressure: 1012,
    windSpeed: 6,
    windDirection: 185,
    rain: 0,
    weatherIcon: '02d',
    weatherDescription: 'Few clouds',
    uvIndex: 6,
    windGust: 8,
    precipitationProbability: 0.1,
  },
  {
    temperature: 22,
    feelsLike: 24,
    humidity: 60,
    pressure: 1011,
    windSpeed: 7,
    windDirection: 190,
    rain: 0.5,
    weatherIcon: '10d',
    weatherDescription: 'Light rain',
    uvIndex: 4,
    windGust: 10,
    precipitationProbability: 0.4,
  },
];

/**
 * Mock GPX file content for testing
 */
export const mockGPXFileContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Test App">
  <metadata>
    <n>Test Route</n>
    <time>2023-01-01T12:00:00Z</time>
  </metadata>
  <trk>
    <n>Track 1</n>
    <trkseg>
      <trkpt lat="47.6062" lon="-122.3321">
        <ele>100</ele>
        <time>2023-01-01T12:00:00Z</time>
      </trkpt>
      <trkpt lat="47.6063" lon="-122.3322">
        <ele>110</ele>
        <time>2023-01-01T12:05:00Z</time>
      </trkpt>
      <trkpt lat="47.6064" lon="-122.3323">
        <ele>120</ele>
        <time>2023-01-01T12:10:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

/**
 * Mock route settings for testing
 */
export const mockRouteSettings = {
  startTime: new Date('2023-01-01T12:00:00Z'),
  weatherInterval: 30,
  avgSpeed: 5,
};

/**
 * Mock route metrics for testing
 */
export const mockRouteMetrics = {
  totalDistance: 1.5,
  totalElevationGain: 20,
  totalElevationLoss: 0,
  maxElevation: 120,
  minElevation: 100,
  startTime: '2023-01-01T12:00:00Z',
  endTime: '2023-01-01T12:10:00Z',
};

/**
 * Mock export options for testing
 */
export const mockExportOptions = {
  includeMap: true,
  includeCharts: true,
  includeWeather: true,
  includeMetrics: true,
  format: 'pdf' as const,
};
