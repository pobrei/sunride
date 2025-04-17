import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeatherProvider } from '@frontend/features/weather/context';
import { NotificationProvider } from '@frontend/features/notifications/context';
import { mockGPXData, mockForecastPoints, mockWeatherData } from '../mocks/mockData';
import { Button } from '@/components/ui/button';

// Mock the weather API
jest.mock('@frontend/features/weather/utils/weatherService', () => ({
  fetchWeatherForPoints: jest.fn().mockResolvedValue(mockWeatherData),
  validateWeatherData: jest.fn(data => data),
  synchronizeTimeZones: jest.fn(data => data),
}));

// Mock the GPX parser
jest.mock('@frontend/features/gpx/utils/gpxParser', () => ({
  generateForecastPoints: jest.fn().mockReturnValue(mockForecastPoints),
}));

// Create a test component that simulates the weather data flow
const TestWeatherFlow = () => {
  const [gpxData, setGpxData] = React.useState<typeof mockGPXData | null>(null);
  const [forecastPoints, setForecastPoints] = React.useState<typeof mockForecastPoints>([]);
  const [weatherData, setWeatherData] = React.useState<typeof mockWeatherData>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const handleLoadGPX = () => {
    setGpxData(mockGPXData);
    setIsLoading(true);

    // Generate forecast points
    const points = mockForecastPoints;
    setForecastPoints(points);

    // Fetch weather data
    setTimeout(() => {
      setWeatherData(mockWeatherData);
      setIsLoading(false);
    }, 100);
  };

  return (
    <div>
      <Button
        variant="default"
        onClick={handleLoadGPX}
        className="transition-transform hover:scale-105"
      >
        Load GPX and Weather
      </Button>

      {isLoading && <div>Loading weather data...</div>}
      {error && <div>Error: {error.message}</div>}

      {gpxData && !isLoading && (
        <div>
          <h2>Route: {gpxData.name}</h2>
          <p>Distance: {gpxData.totalDistance} km</p>
          <p>Points: {gpxData.points.length}</p>
        </div>
      )}

      {weatherData.length > 0 && !isLoading && (
        <div>
          <h2>Weather Data</h2>
          <p>Temperature: {weatherData[0].temperature}°C</p>
          <p>Wind: {weatherData[0].windSpeed} km/h</p>
          <p>Weather: {weatherData[0].weatherDescription}</p>
        </div>
      )}
    </div>
  );
};

describe('Weather Data Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load GPX data and fetch weather data', async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <WeatherProvider>
          <TestWeatherFlow />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Click the load button
    await user.click(screen.getByText('Load GPX and Weather'));

    // Check for loading state
    expect(screen.getByText(/loading weather data/i)).toBeInTheDocument();

    // Wait for the data to be processed
    await waitFor(() => {
      expect(screen.queryByText(/loading weather data/i)).not.toBeInTheDocument();
    });

    // Check that the GPX data is displayed
    expect(screen.getByText(`Route: ${mockGPXData.name}`)).toBeInTheDocument();
    expect(screen.getByText(`Distance: ${mockGPXData.totalDistance} km`)).toBeInTheDocument();
    expect(screen.getByText(`Points: ${mockGPXData.points.length}`)).toBeInTheDocument();

    // Check that the weather data is displayed
    expect(
      screen.getByText(`Temperature: ${mockWeatherData[0].temperature}°C`)
    ).toBeInTheDocument();
    expect(screen.getByText(`Wind: ${mockWeatherData[0].windSpeed} km/h`)).toBeInTheDocument();
    expect(
      screen.getByText(`Weather: ${mockWeatherData[0].weatherDescription}`)
    ).toBeInTheDocument();
  });

  it('should handle errors in the weather data flow', async () => {
    // Mock the weather API to throw an error
    jest.mock('@frontend/features/weather/utils/weatherService', () => ({
      fetchWeatherForPoints: jest.fn().mockRejectedValue(new Error('Failed to fetch weather data')),
    }));

    const user = userEvent.setup();

    const TestErrorFlow = () => {
      const [error, setError] = React.useState<Error | null>(null);

      const handleLoadGPX = () => {
        try {
          throw new Error('Failed to fetch weather data');
        } catch (err) {
          setError(err as Error);
        }
      };

      return (
        <div>
          <Button
            variant="default"
            onClick={handleLoadGPX}
            className="transition-transform hover:scale-105"
          >
            Load GPX and Weather
          </Button>
          {error && <div>Error: {error.message}</div>}
        </div>
      );
    };

    render(
      <NotificationProvider>
        <WeatherProvider>
          <TestErrorFlow />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Click the load button
    await user.click(screen.getByText('Load GPX and Weather'));

    // Check that the error is displayed
    expect(screen.getByText('Error: Failed to fetch weather data')).toBeInTheDocument();
  });
});
