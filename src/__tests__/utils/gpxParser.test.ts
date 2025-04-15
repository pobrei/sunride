import {
  parseGPX,
  calculateDistance,
  generateForecastPoints,
} from '@/features/gpx/utils/gpxParser';
import { mockGPXFileContent, mockForecastPoints } from '../mocks/mockData';

describe('GPX Parser', () => {
  describe('parseGPX', () => {
    it('should parse valid GPX content', () => {
      const result = parseGPX(mockGPXFileContent);

      expect(result).toBeDefined();
      expect(result.name).toBe('Track 1');
      expect(result.points.length).toBe(3);

      // Check first point
      expect(result.points[0].lat).toBe(47.6062);
      expect(result.points[0].lon).toBe(-122.3321);
      expect(result.points[0].elevation).toBe(100);
      expect(result.points[0].time).toBeInstanceOf(Date);
    });

    it('should handle GPX content without track names', () => {
      const gpxWithoutTrackName = mockGPXFileContent.replace('<n>Track 1</n>', '');
      const result = parseGPX(gpxWithoutTrackName);

      expect(result).toBeDefined();
      expect(result.name).toBe('Unnamed Track');
    });

    it('should handle GPX content without metadata name', () => {
      const gpxWithoutMetadataName = mockGPXFileContent.replace('<n>Test Route</n>', '');
      const result = parseGPX(gpxWithoutMetadataName);

      expect(result).toBeDefined();
      expect(result.name).toBe('Unnamed Route');
    });

    it('should throw an error for invalid GPX content', () => {
      const invalidGPX = '<invalid>Not a GPX file</invalid>';

      expect(() => parseGPX(invalidGPX)).toThrow();
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      const lat1 = 47.6062;
      const lon1 = -122.3321;
      const lat2 = 47.6064;
      const lon2 = -122.3323;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // The distance should be approximately 0.03 km
      expect(distance).toBeGreaterThan(0.02);
      expect(distance).toBeLessThan(0.04);
    });

    it('should return 0 for identical points', () => {
      const lat = 47.6062;
      const lon = -122.3321;

      const distance = calculateDistance(lat, lon, lat, lon);

      expect(distance).toBe(0);
    });
  });

  describe('generateForecastPoints', () => {
    it('should generate forecast points with the correct interval', () => {
      const gpxData = parseGPX(mockGPXFileContent);
      const interval = 0.5; // 0.5 km
      const startTime = new Date('2023-01-01T12:00:00Z');
      const avgSpeed = 20; // 20 km/h

      const result = generateForecastPoints(gpxData, interval, startTime, avgSpeed);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(1);

      // Check that points are at the specified interval
      for (let i = 1; i < result.length - 1; i++) {
        const distanceDiff = result[i].distance - result[i - 1].distance;
        expect(distanceDiff).toBeCloseTo(interval, 1);
      }
    });

    it('should handle empty GPX data', () => {
      const emptyGPXData = {
        name: 'Empty Route',
        points: [],
        totalDistance: 0,
        elevationGain: 0,
        elevationLoss: 0,
        maxElevation: 0,
        minElevation: 0,
      };

      const startTime = new Date('2023-01-01T12:00:00Z');
      const avgSpeed = 20; // 20 km/h

      const result = generateForecastPoints(emptyGPXData, 0.5, startTime, avgSpeed);

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });
});
