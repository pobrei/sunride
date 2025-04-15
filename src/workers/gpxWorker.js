/**
 * Web Worker for CPU-intensive GPX file processing
 * This moves calculations off the main thread to prevent UI freezing
 */

// Calculate distance between two points using Haversine formula
const calculateDistance = (point1, point2) => {
  const toRad = value => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lon - point1.lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate total elevation gain/loss
const calculateElevation = points => {
  let gain = 0;
  let loss = 0;

  for (let i = 1; i < points.length; i++) {
    const diff = points[i].ele - points[i - 1].ele;
    if (diff > 0) {
      gain += diff;
    } else {
      loss += Math.abs(diff);
    }
  }

  return { gain, loss };
};

// Calculate weather forecast points along the route
const calculateForecastPoints = (points, interval) => {
  const forecastPoints = [points[0]]; // Always include start point
  let accumulatedDistance = 0;

  for (let i = 1; i < points.length; i++) {
    const segmentDistance = calculateDistance(points[i - 1], points[i]);
    accumulatedDistance += segmentDistance;

    if (accumulatedDistance >= interval) {
      forecastPoints.push(points[i]);
      accumulatedDistance = 0; // Reset accumulated distance
    }
  }

  // Always include end point
  if (forecastPoints[forecastPoints.length - 1] !== points[points.length - 1]) {
    forecastPoints.push(points[points.length - 1]);
  }

  return forecastPoints;
};

// Process messages from main thread
self.addEventListener('message', event => {
  try {
    const { points, settings } = event.data;

    if (!points || !Array.isArray(points) || !settings) {
      throw new Error('Invalid input data');
    }

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += calculateDistance(points[i - 1], points[i]);
    }

    // Calculate elevation statistics
    const elevation = calculateElevation(points);

    // Calculate forecast points
    const forecastInterval = settings.forecastInterval || 5; // Default 5km intervals
    const forecastPoints = calculateForecastPoints(points, forecastInterval);

    // Calculate estimated duration
    const averageSpeed = settings.averageSpeed || 20; // Default 20km/h
    const estimatedDuration = totalDistance / averageSpeed;

    // Send results back to main thread
    self.postMessage({
      success: true,
      totalDistance,
      elevation,
      forecastPoints,
      estimatedDuration,
      stats: {
        pointCount: points.length,
        forecastPointCount: forecastPoints.length,
      },
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
    });
  }
});
