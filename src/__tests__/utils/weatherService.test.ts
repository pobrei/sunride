import { validateWeatherData, synchronizeTimeZones } from '@/features/weather/utils/weatherService';
import { mockWeatherData } from '../mocks/mockData';

describe('Weather Service', () => {
  describe('validateWeatherData', () => {
    it('should validate correct weather data', () => {
      const validData = {
        temperature: 20,
        humidity: 65,
        windSpeed: 5,
        precipitation: 0,
        pressure: 1013,
        clouds: 20,
        time: '2023-01-01T12:00:00Z',
        timezone: 'UTC',
      };

      expect(() => validateWeatherData(validData)).not.toThrow();
      const result = validateWeatherData(validData);
      expect(result).toEqual(validData);
    });

    it('should throw error for invalid weather data', () => {
      const invalidData = {
        temperature: 20,
        humidity: 150, // Invalid: over 100%
        windSpeed: 5,
        precipitation: 0,
        pressure: 1013,
        clouds: 20,
        time: '2023-01-01T12:00:00Z',
      };

      expect(() => validateWeatherData(invalidData)).toThrow();
    });

    it('should throw error for missing required fields', () => {
      const incompleteData = {
        temperature: 20,
        humidity: 65,
        // Missing windSpeed
        precipitation: 0,
        pressure: 1013,
        clouds: 20,
        time: '2023-01-01T12:00:00Z',
      };

      expect(() => validateWeatherData(incompleteData)).toThrow();
    });
  });

  describe('synchronizeTimeZones', () => {
    it('should not modify data if timezones match', () => {
      const data = {
        temperature: 20,
        humidity: 65,
        windSpeed: 5,
        precipitation: 0,
        pressure: 1013,
        clouds: 20,
        time: '2023-01-01T12:00:00Z',
        timezone: 'UTC',
      };

      const result = synchronizeTimeZones(data, 'UTC');
      expect(result).toEqual(data);
    });

    it('should adjust time for different timezones', () => {
      const data = {
        temperature: 20,
        humidity: 65,
        windSpeed: 5,
        precipitation: 0,
        pressure: 1013,
        clouds: 20,
        time: '2023-01-01T12:00:00Z',
        timezone: 'UTC',
      };

      // When synchronizing to a different timezone, the time should be adjusted
      const result = synchronizeTimeZones(data, 'America/Los_Angeles');

      expect(result.timezone).toBe('America/Los_Angeles');
      expect(result.time).not.toBe(data.time);
    });

    it('should handle data without timezone', () => {
      const data = {
        temperature: 20,
        humidity: 65,
        windSpeed: 5,
        precipitation: 0,
        pressure: 1013,
        clouds: 20,
        time: '2023-01-01T12:00:00Z',
      };

      const result = synchronizeTimeZones(data, 'America/Los_Angeles');

      expect(result.timezone).toBe('America/Los_Angeles');
    });
  });
});
