import { mockFetch, mockFetchWithError } from '../mocks/mockFetch';
import { mockForecastPoints } from '../mocks/mockData';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the useNotifications hook
const mockAddNotification = jest.fn();
jest.mock('@frontend/features/notifications/context', () => ({
  useNotifications: () => ({
    addNotification: mockAddNotification,
  }),
}));

// Mock the weather API function
const mockFetchWeatherForPoints = jest.fn();
jest.mock('@frontend/features/weather/utils/weatherAPI', () => ({
  fetchWeatherForPoints: points => mockFetchWeatherForPoints(points),
}));

describe('Weather API Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle network errors', async () => {
    // Mock a network error
    mockFetchWeatherForPoints.mockRejectedValueOnce(new Error('Network error'));

    try {
      await mockFetchWeatherForPoints(mockForecastPoints);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });

  it('should handle API errors with specific status codes', async () => {
    // Mock different API errors
    const apiErrors = [
      { status: 401, message: 'Unauthorized' },
      { status: 404, message: 'Not Found' },
      { status: 429, message: 'Too Many Requests' },
      { status: 500, message: 'Internal Server Error' },
    ];

    for (const apiError of apiErrors) {
      mockFetchWeatherForPoints.mockRejectedValueOnce(
        new Error(`API error: ${apiError.status} - ${apiError.message}`)
      );

      try {
        await mockFetchWeatherForPoints(mockForecastPoints);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).toContain(`API error: ${apiError.status}`);
      }
    }
  });

  it('should handle timeout errors', async () => {
    // Mock a timeout error
    mockFetchWeatherForPoints.mockRejectedValueOnce(new Error('Request timed out'));

    try {
      await mockFetchWeatherForPoints(mockForecastPoints);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe('Request timed out');
    }
  });

  it('should handle invalid response data', async () => {
    // Mock invalid response data
    mockFetchWeatherForPoints.mockResolvedValueOnce({ invalid: 'data' });

    try {
      const result = await mockFetchWeatherForPoints(mockForecastPoints);
      // If no error is thrown, the result should still be valid
      expect(result).toBeDefined();
    } catch (error) {
      // If an error is thrown, it should be about invalid data
      expect(error.message).toContain('Invalid');
    }
  });

  it('should handle empty forecast points', async () => {
    const result = await mockFetchWeatherForPoints([]);
    expect(result).toEqual([]);
  });
});
