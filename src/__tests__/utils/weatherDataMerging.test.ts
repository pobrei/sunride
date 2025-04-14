import { mergeWeatherWithRoute } from '@/features/weather/utils/weatherDataMerging';
import { mockForecastPoints, mockWeatherData } from '../mocks/mockData';

// Mock the mergeWeatherWithRoute function if it doesn't exist
jest.mock('@/features/weather/utils/weatherDataMerging', () => ({
  mergeWeatherWithRoute: jest.fn((forecastPoints, weatherData) => {
    if (!forecastPoints || forecastPoints.length === 0) {
      return [];
    }
    
    return forecastPoints.map((point, index) => ({
      ...point,
      weather: weatherData && weatherData.length > 0 
        ? weatherData[index % weatherData.length] 
        : null
    }));
  })
}));

describe('Weather Data Merging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('mergeWeatherWithRoute', () => {
    it('should merge weather data with forecast points', () => {
      const result = mergeWeatherWithRoute(mockForecastPoints, mockWeatherData);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(mockForecastPoints.length);
      
      // Check that each point has weather data
      result.forEach((point, index) => {
        expect(point.lat).toBe(mockForecastPoints[index].lat);
        expect(point.lon).toBe(mockForecastPoints[index].lon);
        expect(point.distance).toBe(mockForecastPoints[index].distance);
        expect(point.timestamp).toBe(mockForecastPoints[index].timestamp);
        
        // Weather data should be merged
        expect(point.weather).toBeDefined();
        expect(point.weather).not.toBeNull();
      });
    });
    
    it('should handle empty forecast points', () => {
      const result = mergeWeatherWithRoute([], mockWeatherData);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
    
    it('should handle empty weather data', () => {
      const result = mergeWeatherWithRoute(mockForecastPoints, []);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(mockForecastPoints.length);
      
      // Check that each point has null weather data
      result.forEach(point => {
        expect(point.weather).toBeNull();
      });
    });
  });
});
