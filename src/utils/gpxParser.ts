import { ForecastPoint } from '@/lib/weatherAPI';

interface RoutePoint {
  lat: number;
  lon: number;
  elevation: number;
  time?: Date;
  distance: number; // Distance from start in km
}

interface GPXData {
  name: string;
  points: RoutePoint[];
  totalDistance: number; // in km
  elevationGain: number; // in meters
  elevationLoss: number; // in meters
  maxElevation: number; // in meters
  minElevation: number; // in meters
}

// Helper function to calculate distance between two points in km (Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Parse GPX file
export function parseGPX(gpxString: string): GPXData {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxString, 'text/xml');
  
  // Get name
  const nameElement = xmlDoc.querySelector('name') || xmlDoc.querySelector('n');
  const name = nameElement ? nameElement.textContent || 'Unnamed Route' : 'Unnamed Route';
  
  // Get track points
  const trackPoints = Array.from(xmlDoc.querySelectorAll('trkpt, rtept'));
  
  if (trackPoints.length === 0) {
    throw new Error('No track points found in GPX file');
  }
  
  const routePoints: RoutePoint[] = [];
  let totalDistance = 0;
  let prevPoint: {lat: number, lon: number} | null = null;
  let elevationGain = 0;
  let elevationLoss = 0;
  let maxElevation = -Infinity;
  let minElevation = Infinity;
  
  trackPoints.forEach((point, index) => {
    const lat = parseFloat(point.getAttribute('lat') || '0');
    const lon = parseFloat(point.getAttribute('lon') || '0');
    const elevationElement = point.querySelector('ele');
    const elevation = elevationElement ? parseFloat(elevationElement.textContent || '0') : 0;
    const timeElement = point.querySelector('time');
    const time = timeElement ? new Date(timeElement.textContent || '') : undefined;
    
    // Calculate distance
    if (prevPoint) {
      const segmentDistance = calculateDistance(prevPoint.lat, prevPoint.lon, lat, lon);
      totalDistance += segmentDistance;
    }
    
    // Calculate elevation changes
    if (index > 0) {
      const prevElevation = routePoints[index - 1].elevation;
      const elevationDiff = elevation - prevElevation;
      
      if (elevationDiff > 0) {
        elevationGain += elevationDiff;
      } else if (elevationDiff < 0) {
        elevationLoss += Math.abs(elevationDiff);
      }
    }
    
    // Update min/max elevation
    if (elevation > maxElevation) maxElevation = elevation;
    if (elevation < minElevation) minElevation = elevation;
    
    routePoints.push({
      lat,
      lon, 
      elevation,
      time,
      distance: totalDistance
    });
    
    prevPoint = { lat, lon };
  });
  
  return {
    name,
    points: routePoints,
    totalDistance,
    elevationGain,
    elevationLoss,
    maxElevation,
    minElevation
  };
}

// Generate forecast points at given intervals along the route
export function generateForecastPoints(
  gpxData: GPXData, 
  interval: number,  // in km
  startTime: Date,
  avgSpeed: number   // in km/h
): ForecastPoint[] {
  if (!gpxData || !gpxData.points || gpxData.points.length === 0) {
    return [];
  }
  
  const totalDistance = gpxData.totalDistance;
  const points = gpxData.points;
  const forecastPoints: ForecastPoint[] = [];
  
  // Always include the starting point
  forecastPoints.push({
    lat: points[0].lat,
    lon: points[0].lon,
    timestamp: Math.floor(startTime.getTime() / 1000),
    distance: 0
  });
  
  // Calculate points at each interval
  for (let distance = interval; distance < totalDistance; distance += interval) {
    // Find the two points that the interval falls between
    let beforeIndex = 0;
    let afterIndex = 0;
    
    for (let i = 0; i < points.length - 1; i++) {
      if (points[i].distance <= distance && points[i + 1].distance >= distance) {
        beforeIndex = i;
        afterIndex = i + 1;
        break;
      }
    }
    
    const beforePoint = points[beforeIndex];
    const afterPoint = points[afterIndex];
    
    // Interpolate the position
    const ratio = (distance - beforePoint.distance) / (afterPoint.distance - beforePoint.distance);
    const lat = beforePoint.lat + ratio * (afterPoint.lat - beforePoint.lat);
    const lon = beforePoint.lon + ratio * (afterPoint.lon - beforePoint.lon);
    
    // Calculate timestamp based on average speed
    const timeInHours = distance / avgSpeed;
    const timeInSeconds = timeInHours * 3600;
    const timestamp = Math.floor(startTime.getTime() / 1000 + timeInSeconds);
    
    forecastPoints.push({
      lat,
      lon,
      timestamp,
      distance
    });
  }
  
  // Always include the ending point
  const lastPoint = points[points.length - 1];
  const timeInHours = totalDistance / avgSpeed;
  const timeInSeconds = timeInHours * 3600;
  const endTimestamp = Math.floor(startTime.getTime() / 1000 + timeInSeconds);
  
  forecastPoints.push({
    lat: lastPoint.lat,
    lon: lastPoint.lon,
    timestamp: endTimestamp,
    distance: totalDistance
  });
  
  return forecastPoints;
}

export type { RoutePoint, GPXData }; 