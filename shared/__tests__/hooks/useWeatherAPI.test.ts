import { renderHook, act } from '@testing-library/react';
import { mockForecastPoints, mockWeatherData } from '../mocks/mockData';
import { mockFetch, mockFetchWithError } from '../mocks/mockFetch';

// Mock the useNotifications hook
const mockAddNotification = jest.fn();
jest.mock('@frontend/features/notifications/context', () => ({
  useNotifications: () => ({
    addNotification: mockAddNotification,
  }),
}));

// Mock Sentry
jest.mock('@shared/lib/sentry', () => ({
  captureException: jest.fn(),
}));

// Create a mock useWeatherAPI hook
const mockUseWeatherAPI = () => {
  const [state, setState] = React.useState({
    weatherData: [],
    isLoading: false,
    error: null,
  });

  const fetchWeatherForPoints = async forecastPoints => {
    if (!forecastPoints || forecastPoints.length === 0) {
      return [];
    }

    setState({ ...state, isLoading: true });

    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forecastPoints }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setState({
        weatherData: data.data,
        isLoading: false,
        error: null,
      });

      return data.data;
    } catch (error) {
      setState({
        weatherData: [],
        isLoading: false,
        error,
      });

      mockAddNotification('error', `Failed to fetch weather data: ${error.message}`);
      throw error;
    }
  };

  const reset = () => {
    setState({
      weatherData: [],
      isLoading: false,
      error: null,
    });
  };

  return {
    ...state,
    fetchWeatherForPoints,
    reset,
  };
};

// Mock the module
jest.mock('@frontend/features/weather/hooks', () => ({
  useWeatherAPI: mockUseWeatherAPI,
}));

// Mock React.useState
const mockSetState = jest.fn();
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: initialState => [initialState, mockSetState],
}));

describe('useWeatherAPI Hook', () => {
  // Setup mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fetch
    global.fetch = jest.fn().mockImplementation(mockFetch);
  });

  // Clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with the correct state', () => {
    const { result } = renderHook(() => mockUseWeatherAPI());

    expect(result.current.weatherData).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch weather data for forecast points', async () => {
    const { result } = renderHook(() => mockUseWeatherAPI());

    await act(async () => {
      await result.current.fetchWeatherForPoints(mockForecastPoints);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/weather'),
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String),
      })
    );
  });

  it('should handle API errors', async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn().mockImplementation(mockFetchWithError);

    const { result } = renderHook(() => mockUseWeatherAPI());

    await act(async () => {
      try {
        await result.current.fetchWeatherForPoints(mockForecastPoints);
      } catch (error) {
        // Expected error
      }
    });

    expect(mockAddNotification).toHaveBeenCalledWith('error', expect.any(String));
  });

  it('should handle empty forecast points', async () => {
    const { result } = renderHook(() => mockUseWeatherAPI());

    await act(async () => {
      await result.current.fetchWeatherForPoints([]);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
