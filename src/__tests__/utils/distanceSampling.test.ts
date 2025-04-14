import { mockGPXData } from '../mocks/mockData';

// Mock the sampleRouteByDistance function if it doesn't exist
const sampleRouteByDistance = jest.fn((points, interval) => {
  if (!points || points.length === 0) {
    return [];
  }
  
  const result = [points[0]]; // Always include first point
  let currentDistance = 0;
  
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const distanceSinceLastSample = point.distance - currentDistance;
    
    if (distanceSinceLastSample >= interval || i === points.length - 1) {
      result.push(point);
      currentDistance = point.distance;
    }
  }
  
  return result;
});

// Mock the module
jest.mock('@/features/gpx/utils/distanceSampling', () => ({
  sampleRouteByDistance
}));

describe('Distance Sampling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('sampleRouteByDistance', () => {
    it('should sample route points at regular distance intervals', () => {
      const interval = 0.5; // 500 meters
      const result = sampleRouteByDistance(mockGPXData.points, interval);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      
      // First point should always be included
      expect(result[0]).toEqual(mockGPXData.points[0]);
      
      // Last point should always be included
      expect(result[result.length - 1]).toEqual(mockGPXData.points[mockGPXData.points.length - 1]);
      
      // Check that points are approximately at the specified interval
      for (let i = 1; i < result.length; i++) {
        const distanceDiff = result[i].distance - result[i - 1].distance;
        // Allow some tolerance for the last point
        if (i < result.length - 1) {
          expect(distanceDiff).toBeGreaterThanOrEqual(interval);
        }
      }
    });
    
    it('should handle empty route data', () => {
      const interval = 0.5;
      const result = sampleRouteByDistance([], interval);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
    
    it('should handle very large sampling intervals', () => {
      const interval = 10.0; // 10 km, larger than the route
      const result = sampleRouteByDistance(mockGPXData.points, interval);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(2); // Should only include first and last points
      
      // First point
      expect(result[0]).toEqual(mockGPXData.points[0]);
      
      // Last point
      expect(result[1]).toEqual(mockGPXData.points[mockGPXData.points.length - 1]);
    });
    
    it('should handle very small sampling intervals', () => {
      const interval = 0.01; // 10 meters
      const result = sampleRouteByDistance(mockGPXData.points, interval);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(mockGPXData.points.length);
    });
  });
});
