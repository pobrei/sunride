import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Map from '@/components/Map';
import { WeatherProvider } from '@/context/WeatherContext';
import { NotificationProvider } from '@/components/NotificationProvider';

// Mock the dynamic import
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: any) => {
    const Component = fn();
    Component.displayName = 'DynamicComponent';
    return Component;
  },
}));

// Mock the leaflet and react-leaflet modules
jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: jest.fn(),
      },
      mergeOptions: jest.fn(),
    },
  },
  icon: jest.fn(() => ({})),
  divIcon: jest.fn(() => ({})),
  latLngBounds: jest.fn(() => ({
    isValid: jest.fn(() => true),
  })),
}));

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  Polyline: () => <div data-testid="polyline" />,
  LayerGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layer-group">{children}</div>
  ),
  useMap: () => ({
    setView: jest.fn(),
    getZoom: jest.fn(() => 13),
    fitBounds: jest.fn(),
  }),
}));

// Sample test data
const mockGpxData = {
  name: 'Test Route',
  points: [
    { lat: 37.7749, lon: -122.4194, elevation: 10, distance: 0, time: '2023-10-15T10:00:00Z' },
    { lat: 37.7847, lon: -122.4294, elevation: 20, distance: 1000, time: '2023-10-15T10:30:00Z' },
    { lat: 37.7946, lon: -122.4394, elevation: 30, distance: 2000, time: '2023-10-15T11:00:00Z' },
  ],
  totalDistance: 2000,
  totalElevationGain: 30,
  totalTime: 3600,
};

const mockForecastPoints = [
  { lat: 37.7749, lon: -122.4194, timestamp: '2023-10-15T10:00:00Z', distance: 0 },
  { lat: 37.7847, lon: -122.4294, timestamp: '2023-10-15T10:30:00Z', distance: 1000 },
  { lat: 37.7946, lon: -122.4394, timestamp: '2023-10-15T11:00:00Z', distance: 2000 },
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
    timestamp: '2023-10-15T10:00:00Z',
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
    timestamp: '2023-10-15T10:30:00Z',
  },
  {
    temperature: 20,
    feelsLike: 19,
    humidity: 60,
    pressure: 1011,
    windSpeed: 15,
    windDirection: 200,
    windGust: 22,
    rain: 0,
    snow: 0,
    precipitationProbability: 0,
    weatherIcon: '01d',
    weatherDescription: 'Clear sky',
    cloudCover: 0,
    visibility: 10000,
    uvIndex: 7,
    timestamp: '2023-10-15T11:00:00Z',
  },
];

describe('Map Component', () => {
  const mockOnMarkerClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when no data is provided', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Map
            gpxData={null}
            forecastPoints={[]}
            weatherData={[]}
            onMarkerClick={mockOnMarkerClick}
            selectedMarker={null}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders the map when data is provided', async () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Map
            gpxData={mockGpxData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            onMarkerClick={mockOnMarkerClick}
            selectedMarker={null}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Wait for the dynamic component to load
    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    // Check if map components are rendered
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
    expect(screen.getByTestId('polyline')).toBeInTheDocument();
    expect(screen.getByTestId('layer-group')).toBeInTheDocument();
  });

  it('renders markers for each forecast point', async () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Map
            gpxData={mockGpxData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            onMarkerClick={mockOnMarkerClick}
            selectedMarker={null}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Wait for the dynamic component to load
    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    // Check if markers are rendered
    const markers = screen.getAllByTestId('marker');
    expect(markers.length).toBe(mockForecastPoints.length);
  });

  it('calls onMarkerClick when a marker is clicked', async () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Map
            gpxData={mockGpxData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            onMarkerClick={mockOnMarkerClick}
            selectedMarker={null}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Wait for the dynamic component to load
    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    // Click on the first marker
    const markers = screen.getAllByTestId('marker');
    userEvent.click(markers[0]);

    // Check if onMarkerClick was called
    expect(mockOnMarkerClick).toHaveBeenCalledTimes(1);
    expect(mockOnMarkerClick).toHaveBeenCalledWith(0);
  });
});
