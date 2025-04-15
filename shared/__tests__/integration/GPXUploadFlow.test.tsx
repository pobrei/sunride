import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GPXUploader } from '@frontend/features/gpx/components';
import { WeatherProvider } from '@frontend/features/weather/context';
import { NotificationProvider } from '@frontend/features/notifications/context';
import { mockGPXFileContent, mockGPXData, mockWeatherData } from '../mocks/mockData';
import { parseGPX } from '@frontend/features/gpx/utils/gpxParser';
import { useWeatherAPI } from '@frontend/features/weather/hooks';

// Mock the hooks and utilities
jest.mock('@frontend/features/gpx/utils/gpxParser', () => ({
  parseGPX: jest.fn(),
  generateForecastPoints: jest.fn(),
}));

jest.mock('@frontend/features/weather/hooks', () => ({
  useWeatherAPI: jest.fn(),
}));

// Create a test component that simulates the upload flow
const TestUploadFlow = () => {
  const [gpxData, setGpxData] = React.useState<typeof mockGPXData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGPXLoaded = (data: typeof mockGPXData) => {
    setGpxData(data);
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  return (
    <div>
      <GPXUploader onGPXLoaded={handleGPXLoaded} />

      {isLoading && <div>Loading weather data...</div>}

      {gpxData && !isLoading && (
        <div>
          <h2>Route: {gpxData.name}</h2>
          <p>Distance: {gpxData.totalDistance} km</p>
          <p>Elevation gain: {gpxData.elevationGain} m</p>
          <p>Points: {gpxData.points.length}</p>
        </div>
      )}
    </div>
  );
};

describe('GPX Upload Flow Integration', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock parseGPX function
    (parseGPX as jest.Mock).mockReturnValue(mockGPXData);

    // Mock useWeatherAPI hook
    (useWeatherAPI as jest.Mock).mockReturnValue({
      weatherData: mockWeatherData,
      isLoading: false,
      error: null,
      fetchWeatherForPoints: jest.fn().mockResolvedValue(mockWeatherData),
      reset: jest.fn(),
    });
  });

  // Clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle the complete GPX upload flow', async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <WeatherProvider>
          <TestUploadFlow />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Create a mock file
    const file = new File([mockGPXFileContent], 'test.gpx', { type: 'application/gpx+xml' });

    // Get the file input
    const fileInput = screen.getByTestId('gpx-file-input');

    // Simulate file upload
    await user.upload(fileInput, file);

    // Check for loading state
    expect(screen.getByText(/loading weather data/i)).toBeInTheDocument();

    // Wait for the data to be processed
    await waitFor(() => {
      expect(screen.queryByText(/loading weather data/i)).not.toBeInTheDocument();
      expect(screen.getByText(/route:/i)).toBeInTheDocument();
      expect(screen.getByText(/distance:/i)).toBeInTheDocument();
      expect(screen.getByText(/elevation gain:/i)).toBeInTheDocument();
      expect(screen.getByText(/points:/i)).toBeInTheDocument();
    });

    // Check that the route data is displayed correctly
    expect(screen.getByText(`Route: ${mockGPXData.name}`)).toBeInTheDocument();
    expect(screen.getByText(`Distance: ${mockGPXData.totalDistance} km`)).toBeInTheDocument();
    expect(screen.getByText(`Elevation gain: ${mockGPXData.elevationGain} m`)).toBeInTheDocument();
    expect(screen.getByText(`Points: ${mockGPXData.points.length}`)).toBeInTheDocument();
  });

  it('should handle errors in the GPX upload flow', async () => {
    const user = userEvent.setup();

    // Mock parseGPX to throw an error
    (parseGPX as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid GPX file');
    });

    render(
      <NotificationProvider>
        <WeatherProvider>
          <TestUploadFlow />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Create a mock file
    const file = new File(['<invalid>Not a GPX file</invalid>'], 'test.gpx', {
      type: 'application/gpx+xml',
    });

    // Get the file input
    const fileInput = screen.getByTestId('gpx-file-input');

    // Simulate file upload
    await user.upload(fileInput, file);

    // Check that no route data is displayed
    await waitFor(() => {
      expect(screen.queryByText(/route:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/distance:/i)).not.toBeInTheDocument();
    });
  });
});
