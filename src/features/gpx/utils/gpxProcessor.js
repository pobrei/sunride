/**
 * GPX processing service using Web Workers
 * Offloads CPU-intensive calculations to a background thread
 */

export class GPXProcessor {
  constructor() {
    this.worker = null;
    this.initWorker();
  }

  initWorker() {
    if (typeof window === 'undefined') return; // Server-side guard
    
    // Create worker only in browser environment
    if (window.Worker) {
      this.worker = new Worker(new URL('../workers/gpxWorker.js', import.meta.url));
    } else {
      console.warn('Web Workers not supported, calculations will run on main thread');
    }
  }

  /**
   * Process GPX data with or without Web Worker
   * @param {Array} points - Array of track points
   * @param {Object} settings - Processing settings
   * @returns {Promise} - Promise resolving to processing results
   */
  processGPXData(points, settings) {
    // If worker is available, use it
    if (this.worker) {
      return new Promise((resolve, reject) => {
        // Set up one-time response handler
        const responseHandler = (event) => {
          this.worker.removeEventListener('message', responseHandler);
          
          if (event.data.success) {
            resolve(event.data);
          } else {
            reject(new Error(event.data.error || 'GPX processing failed'));
          }
        };
        
        // Listen for response
        this.worker.addEventListener('message', responseHandler);
        
        // Send data to worker
        this.worker.postMessage({ points, settings });
      });
    } else {
      // Fallback to synchronous processing
      return this.processGPXDataSync(points, settings);
    }
  }

  /**
   * Synchronous processing fallback
   * Used when Web Workers are not available
   */
  processGPXDataSync(points, settings) {
    try {
      // Calculate total distance
      let totalDistance = 0;
      for (let i = 1; i < points.length; i++) {
        totalDistance += this.calculateDistance(points[i-1], points[i]);
      }
      
      // Calculate elevation statistics
      const elevation = this.calculateElevation(points);
      
      // Calculate forecast points
      const forecastInterval = settings.forecastInterval || 5; // Default 5km intervals
      const forecastPoints = this.calculateForecastPoints(points, forecastInterval);
      
      // Calculate estimated duration
      const averageSpeed = settings.averageSpeed || 20; // Default 20km/h
      const estimatedDuration = totalDistance / averageSpeed;
      
      return {
        success: true,
        totalDistance,
        elevation,
        forecastPoints,
        estimatedDuration,
        stats: {
          pointCount: points.length,
          forecastPointCount: forecastPoints.length
        }
      };
    } catch (error) {
      throw new Error(`GPX processing failed: ${error.message}`);
    }
  }

  // Helper methods (duplicated from worker for fallback)
  calculateDistance(point1, point2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lon - point1.lon);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  calculateElevation(points) {
    let gain = 0;
    let loss = 0;
    
    for (let i = 1; i < points.length; i++) {
      const diff = points[i].ele - points[i-1].ele;
      if (diff > 0) {
        gain += diff;
      } else {
        loss += Math.abs(diff);
      }
    }
    
    return { gain, loss };
  }

  calculateForecastPoints(points, interval) {
    const forecastPoints = [points[0]]; // Always include start point
    let accumulatedDistance = 0;
    
    for (let i = 1; i < points.length; i++) {
      const segmentDistance = this.calculateDistance(points[i-1], points[i]);
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
  }
}
