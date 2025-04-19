import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';

interface CSVExportOptions {
  gpxData: GPXData;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  filename?: string;
}

export async function exportToCSV({
  gpxData,
  forecastPoints,
  weatherData,
  filename,
}: CSVExportOptions): Promise<boolean> {
  if (!gpxData || forecastPoints.length === 0) {
    console.error('No data available for CSV export');
    return false;
  }

  try {
    // Create CSV header
    const headers = [
      'Distance (km)',
      'Timestamp',
      'Time',
      'Latitude',
      'Longitude',
      'Temperature (°C)',
      'Feels Like (°C)',
      'Wind Speed (m/s)',
      'Wind Direction (°)',
      'Precipitation (mm)',
      'Humidity (%)',
      'Pressure (hPa)',
      'UV Index',
      'Weather Description',
    ];

    // Create CSV rows
    const rows = forecastPoints.map((point, index) => {
      const weather = weatherData[index];
      const timestamp = new Date(point.timestamp * 1000);
      const timeStr = timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const dateTimeStr = timestamp.toISOString();

      return [
        point.distance.toFixed(2),
        dateTimeStr,
        timeStr,
        point.lat.toFixed(6),
        point.lon.toFixed(6),
        weather?.temperature?.toFixed(1) || '',
        weather?.feelsLike?.toFixed(1) || '',
        weather?.windSpeed?.toFixed(1) || '',
        weather?.windDirection?.toString() || '',
        weather?.precipitation?.toFixed(2) || '0.00',
        weather?.humidity?.toString() || '',
        weather?.pressure?.toString() || '',
        weather?.uvIndex?.toString() || '',
        weather?.weatherDescription || '',
      ];
    });

    // Add route summary as first rows
    const summaryRows = [
      ['Route Summary', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Name', gpxData.name, '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Total Distance (km)', gpxData.totalDistance.toFixed(2), '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Elevation Gain (m)', gpxData.elevationGain.toFixed(0), '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Elevation Loss (m)', gpxData.elevationLoss.toFixed(0), '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Max Elevation (m)', gpxData.maxElevation.toFixed(0), '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Min Elevation (m)', gpxData.minElevation.toFixed(0), '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', ''], // Empty row as separator
    ];

    // Combine all rows
    const allRows = [...summaryRows, [headers], ...rows];

    // Convert to CSV string
    const csvContent = allRows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      filename || `${gpxData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_weather_data_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error generating CSV:', error);
    return false;
  }
}
