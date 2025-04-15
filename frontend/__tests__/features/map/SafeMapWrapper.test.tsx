import React from 'react';
import { render, screen } from '@testing-library/react';
import { SafeMapWrapper } from '@frontend/features/map/components';
import { SafeDataProvider } from '@frontend/features/data-validation/context';

// Mock the OpenLayersMap component
jest.mock('@frontend/features/map/components/OpenLayersMap', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-map">Mock Map</div>,
}));

// Mock the useSafeData hook
jest.mock('@frontend/features/data-validation/context', () => ({
  ...jest.requireActual('@/features/data-validation/context'),
  useSafeData: () => ({
    validateData: jest.fn(data => data),
    handleError: jest.fn(),
  }),
}));

describe('SafeMapWrapper Component', () => {
  const mockGpxData = {
    name: 'Test Route',
    points: [
      { lat: 37.7749, lon: -122.4194, elevation: 10, distance: 0, time: '2023-10-15T10:00:00Z' },
      { lat: 37.7847, lon: -122.4294, elevation: 20, distance: 1000, time: '2023-10-15T10:30:00Z' },
    ],
    totalDistance: 1000,
    totalElevationGain: 10,
    totalTime: 1800,
  };

  const mockForecastPoints = [
    { lat: 37.7749, lon: -122.4194, timestamp: 1634292000, distance: 0 },
    { lat: 37.7847, lon: -122.4294, timestamp: 1634293800, distance: 1000 },
  ];

  const mockWeatherData = [
    {
      temperature: 18,
      feelsLike: 17,
      humidity: 65,
      pressure: 1013,
      windSpeed: 10,
      windDirection: 180,
      windGust: 15,
      rain: 0,
      snow: 0,
      precipitationProbability: 0,
      weatherIcon: '01d',
      weatherDescription: 'Clear sky',
      cloudCover: 0,
      visibility: 10000,
      uvIndex: 5,
      timestamp: 1634292000,
    },
    {
      temperature: 19,
      feelsLike: 18,
      humidity: 62,
      pressure: 1012,
      windSpeed: 12,
      windDirection: 190,
      windGust: 18,
      rain: 0,
      snow: 0,
      precipitationProbability: 0,
      weatherIcon: '02d',
      weatherDescription: 'Few clouds',
      cloudCover: 20,
      visibility: 10000,
      uvIndex: 6,
      timestamp: 1634293800,
    },
  ];

  const mockOnMarkerClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the map when valid data is provided', () => {
    render(
      <SafeDataProvider>
        <SafeMapWrapper
          gpxData={mockGpxData}
          forecastPoints={mockForecastPoints}
          weatherData={mockWeatherData}
          onMarkerClick={mockOnMarkerClick}
          selectedMarker={null}
        />
      </SafeDataProvider>
    );

    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
  });

  it('renders a fallback UI when no GPX data is provided', () => {
    render(
      <SafeDataProvider>
        <SafeMapWrapper
          gpxData={null}
          forecastPoints={[]}
          weatherData={[]}
          onMarkerClick={mockOnMarkerClick}
          selectedMarker={null}
        />
      </SafeDataProvider>
    );

    expect(screen.getByText(/No route data available/i)).toBeInTheDocument();
  });

  it('renders a fallback UI when forecast points are empty', () => {
    render(
      <SafeDataProvider>
        <SafeMapWrapper
          gpxData={mockGpxData}
          forecastPoints={[]}
          weatherData={[]}
          onMarkerClick={mockOnMarkerClick}
          selectedMarker={null}
        />
      </SafeDataProvider>
    );

    expect(screen.getByText(/No forecast points available/i)).toBeInTheDocument();
  });
});
