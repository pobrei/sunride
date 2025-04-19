import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';

interface GPXExportOptions {
  gpxData: GPXData;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  filename?: string;
}

export async function exportToGPX({
  gpxData,
  forecastPoints,
  weatherData,
  filename,
}: GPXExportOptions): Promise<boolean> {
  if (!gpxData || forecastPoints.length === 0) {
    console.error('No data available for GPX export');
    return false;
  }

  try {
    // Create GPX XML structure
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xmlns:wptx1="http://www.garmin.com/xmlschemas/WaypointExtension/v1"
     xmlns:gpxtrx="http://www.garmin.com/xmlschemas/GpxExtensions/v3"
     xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
     xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3"
     xmlns:sunride="http://www.sunride.app/xmlschemas/WeatherExtension/v1"
     creator="SunRide"
     version="1.1"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(gpxData.name)}</name>
    <desc>Route with weather data exported from SunRide</desc>
    <time>${new Date().toISOString()}</time>
    <keywords>SunRide, weather, cycling, route</keywords>
  </metadata>
  <trk>
    <name>${escapeXml(gpxData.name)}</name>
    <desc>Total distance: ${gpxData.totalDistance.toFixed(2)} km, Elevation gain: ${gpxData.elevationGain.toFixed(0)} m</desc>
    <trkseg>
${generateTrackPoints(gpxData, forecastPoints, weatherData)}
    </trkseg>
  </trk>
</gpx>`;

    // Create a Blob and download link
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      filename || `${gpxData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_with_weather_${new Date().toISOString().split('T')[0]}.gpx`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error generating GPX:', error);
    return false;
  }
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate track points with weather data
function generateTrackPoints(
  gpxData: GPXData,
  forecastPoints: ForecastPoint[],
  weatherData: (WeatherData | null)[]
): string {
  // Create a map of distances to weather data for quick lookup
  const weatherMap = new Map<number, WeatherData | null>();
  forecastPoints.forEach((point, index) => {
    weatherMap.set(point.distance, weatherData[index]);
  });

  // Generate track points XML
  return gpxData.points.map(point => {
    // Find the closest forecast point by distance
    const closestForecastPoint = findClosestForecastPoint(point.distance, forecastPoints);
    const weather = closestForecastPoint ? weatherMap.get(closestForecastPoint.distance) : null;

    // Format time
    const timeStr = point.time ? point.time.toISOString() : '';

    // Create track point XML
    let trackPoint = `      <trkpt lat="${point.lat}" lon="${point.lon}">
        <ele>${point.elevation || 0}</ele>`;

    if (timeStr) {
      trackPoint += `\n        <time>${timeStr}</time>`;
    }

    // Add weather data as extensions if available
    if (weather) {
      trackPoint += `
        <extensions>
          <sunride:weather>
            <sunride:temperature>${weather.temperature.toFixed(1)}</sunride:temperature>
            <sunride:feelsLike>${weather.feelsLike.toFixed(1)}</sunride:feelsLike>
            <sunride:windSpeed>${weather.windSpeed.toFixed(1)}</sunride:windSpeed>
            <sunride:windDirection>${weather.windDirection}</sunride:windDirection>
            <sunride:precipitation>${(weather.precipitation || 0).toFixed(2)}</sunride:precipitation>
            <sunride:humidity>${weather.humidity}</sunride:humidity>
            <sunride:pressure>${weather.pressure}</sunride:pressure>
            <sunride:uvIndex>${weather.uvIndex}</sunride:uvIndex>
            <sunride:weatherDescription>${escapeXml(weather.weatherDescription)}</sunride:weatherDescription>
          </sunride:weather>
        </extensions>`;
    }

    trackPoint += `\n      </trkpt>`;
    return trackPoint;
  }).join('\n');
}

// Find the closest forecast point by distance
function findClosestForecastPoint(distance: number, forecastPoints: ForecastPoint[]): ForecastPoint | null {
  if (forecastPoints.length === 0) return null;

  let closestPoint = forecastPoints[0];
  let minDiff = Math.abs(distance - closestPoint.distance);

  for (let i = 1; i < forecastPoints.length; i++) {
    const diff = Math.abs(distance - forecastPoints[i].distance);
    if (diff < minDiff) {
      minDiff = diff;
      closestPoint = forecastPoints[i];
    }
  }

  return closestPoint;
}
