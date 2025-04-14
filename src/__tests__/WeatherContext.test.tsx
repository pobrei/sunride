import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { WeatherProvider, useWeather } from '@/features/weather/context';
import { NotificationProvider } from '@/features/notifications/context';

// Mock the API functions
jest.mock('@/lib/mongodb-api', () => ({
  fetchWeatherForPoints: jest.fn().mockResolvedValue([
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
  ]),
}));

// Mock the GPX parser
jest.mock('@/utils/gpxParser', () => ({
  generateForecastPoints: jest.fn().mockReturnValue([
    { lat: 37.7749, lon: -122.4194, timestamp: '2023-10-15T10:00:00Z', distance: 0 },
  ]),
}));

// Mock the NotificationProvider
jest.mock('@/features/notifications/context', () => ({
  useNotifications: () => ({
    addNotification: jest.fn().mockReturnValue('mock-id'),
    removeNotification: jest.fn(),
  }),
}));

// Test component that uses the WeatherContext
const TestComponent = () => {
  const {
    gpxData,
    setGpxData,
    forecastPoints,
    weatherData,
    selectedMarker,
    setSelectedMarker,
    isLoading,
    isGenerating,
    error,
    generateWeatherForecast,
  } = useWeather();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="generating">{isGenerating ? 'Generating' : 'Not Generating'}</div>
      <div data-testid="error">{error ? error.message : 'No Error'}</div>
      <div data-testid="forecast-points">{forecastPoints.length}</div>
      <div data-testid="weather-data">{weatherData.length}</div>
      <div data-testid="selected-marker">{selectedMarker !== null ? selectedMarker : 'None'}</div>
      <button
        data-testid="set-gpx-data"
        onClick={() =>
          setGpxData({
            name: 'Test Route',
            points: [
              { lat: 37.7749, lon: -122.4194, elevation: 10, distance: 0, time: '2023-10-15T10:00:00Z' },
            ],
            totalDistance: 0,
            totalElevationGain: 10,
            totalTime: 0,
          })
        }
      >
        Set GPX Data
      </button>
      <button
        data-testid="set-selected-marker"
        onClick={() => setSelectedMarker(0)}
      >
        Set Selected Marker
      </button>
      {/* Notification button removed as we now use NotificationProvider */}
      <button
        data-testid="generate-forecast"
        onClick={() => generateWeatherForecast(5, new Date(), 20)}
      >
        Generate Forecast
      </button>
    </div>
  );
};

describe('WeatherContext', () => {
  it('provides the context values to consuming components', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Check initial state
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('generating')).toHaveTextContent('Not Generating');
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    expect(screen.getByTestId('forecast-points')).toHaveTextContent('0');
    expect(screen.getByTestId('weather-data')).toHaveTextContent('0');
    expect(screen.getByTestId('selected-marker')).toHaveTextContent('None');
  });

  it('allows setting GPX data', async () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Click the button to set GPX data
    act(() => {
      screen.getByTestId('set-gpx-data').click();
    });

    // Check if GPX data was set
    await waitFor(() => {
      expect(screen.getByTestId('forecast-points')).toHaveTextContent('0');
    });
  });

  it('allows setting selected marker', async () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Click the button to set selected marker
    act(() => {
      screen.getByTestId('set-selected-marker').click();
    });

    // Check if selected marker was set
    await waitFor(() => {
      expect(screen.getByTestId('selected-marker')).toHaveTextContent('0');
    });
  });

  it('generates weather forecast', async () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Set GPX data first
    act(() => {
      screen.getByTestId('set-gpx-data').click();
    });

    // Click the button to generate forecast
    act(() => {
      screen.getByTestId('generate-forecast').click();
    });

    // Check if loading state is set
    expect(screen.getByTestId('generating')).toHaveTextContent('Generating');

    // Wait for forecast to be generated
    await waitFor(() => {
      expect(screen.getByTestId('generating')).toHaveTextContent('Not Generating');
      expect(screen.getByTestId('forecast-points')).toHaveTextContent('1');
      expect(screen.getByTestId('weather-data')).toHaveTextContent('1');
    });
  });
});
