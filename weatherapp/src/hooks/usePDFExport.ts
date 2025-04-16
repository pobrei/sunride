import { useState, useCallback, RefObject } from 'react';
import { jsPDF } from 'jspdf';
import { useNotifications } from '@/hooks/useNotifications';
import { GPXData, ForecastPoint, WeatherData } from '@/types';

interface PDFExportOptions {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
}

/**
 * Custom hook for PDF export functionality
 */
export function usePDFExport({ gpxData, forecastPoints, weatherData }: PDFExportOptions) {
  const [isExporting, setIsExporting] = useState(false);
  const { addNotification } = useNotifications();

  /**
   * Generate and export a PDF report
   */
  const exportPDF = useCallback(async () => {
    if (!gpxData || forecastPoints.length === 0 || weatherData.length === 0) {
      addNotification('error', 'No route or weather data available for export');
      return;
    }

    setIsExporting(true);
    try {
      // Create PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      doc.setFontSize(24);
      doc.text('Weather Forecast Report', 10, 20);

      // Add route info
      doc.setFontSize(14);
      doc.text(`Route: ${gpxData.name}`, 10, 30);
      doc.text(`Distance: ${(gpxData.totalDistance / 1000).toFixed(1)} km`, 10, 40);
      doc.text(`Elevation Gain: ${gpxData.elevationGain.toFixed(0)} m`, 10, 50);

      // Generate filename and save
      const sanitizedName = gpxData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${sanitizedName}_weather_forecast_${dateStr}.pdf`;

      doc.save(filename);
      addNotification('success', 'PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      addNotification('error', 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  }, [gpxData, forecastPoints, weatherData, addNotification]);

  return {
    isExporting,
    exportPDF
  };
}
