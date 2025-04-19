import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';

interface JSONExportOptions {
  gpxData: GPXData;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  filename?: string;
}

export async function exportToJSON({
  gpxData,
  forecastPoints,
  weatherData,
  filename,
}: JSONExportOptions): Promise<boolean> {
  if (!gpxData || forecastPoints.length === 0) {
    console.error('No data available for JSON export');
    return false;
  }

  try {
    // Create a structured JSON object with all data
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        appName: 'SunRide',
        version: '1.0.0',
      },
      route: {
        name: gpxData.name,
        totalDistance: gpxData.totalDistance,
        elevationGain: gpxData.elevationGain,
        elevationLoss: gpxData.elevationLoss,
        maxElevation: gpxData.maxElevation,
        minElevation: gpxData.minElevation,
        points: gpxData.points.map(point => ({
          lat: point.lat,
          lon: point.lon,
          elevation: point.elevation,
          time: point.time ? point.time.toISOString() : null,
          distance: point.distance,
        })),
      },
      forecast: forecastPoints.map((point, index) => {
        const weather = weatherData[index];
        return {
          point: {
            lat: point.lat,
            lon: point.lon,
            distance: point.distance,
            timestamp: point.timestamp,
            time: new Date(point.timestamp * 1000).toISOString(),
          },
          weather: weather ? {
            temperature: weather.temperature,
            feelsLike: weather.feelsLike,
            humidity: weather.humidity,
            pressure: weather.pressure,
            windSpeed: weather.windSpeed,
            windDirection: weather.windDirection,
            precipitation: weather.precipitation || 0,
            weatherIcon: weather.weatherIcon,
            weatherDescription: weather.weatherDescription,
            uvIndex: weather.uvIndex,
          } : null,
        };
      }),
    };

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create a Blob and download link
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      filename || `${gpxData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_weather_data_${new Date().toISOString().split('T')[0]}.json`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error generating JSON:', error);
    return false;
  }
}
