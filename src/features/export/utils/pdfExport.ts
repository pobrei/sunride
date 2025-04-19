import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import {
  formatDistance,
  formatDateTime,
  formatTemperature,
  formatWind,
  formatElevation,
  formatPrecipitation,
} from '@/utils/formatUtils';

/**
 * Helper function to handle modern CSS color functions that html2canvas doesn't support
 * This is used in the onclone callback for html2canvas
 */
function handleModernCssColors(document: Document, clone: Document): void {
  // Find all elements with styles in the cloned document
  const elementsWithStyles = clone.querySelectorAll('*');

  // Replace modern color functions with standard hex or rgb colors
  elementsWithStyles.forEach(el => {
    if (el instanceof HTMLElement) {
      try {
        const computedStyle = window.getComputedStyle(el);

        // Apply computed background color directly
        if (computedStyle.backgroundColor &&
            (computedStyle.backgroundColor.includes('oklch') ||
             computedStyle.backgroundColor.includes('hsl'))) {
          // Get the actual computed color as rendered by the browser
          const bgColor = getRgbFromComputedStyle(computedStyle.backgroundColor);
          el.style.backgroundColor = bgColor || '#ffffff';
        }

        // Apply computed text color directly
        if (computedStyle.color &&
            (computedStyle.color.includes('oklch') ||
             computedStyle.color.includes('hsl'))) {
          const textColor = getRgbFromComputedStyle(computedStyle.color);
          el.style.color = textColor || '#000000';
        }

        // Apply computed border color directly
        if (computedStyle.borderColor &&
            (computedStyle.borderColor.includes('oklch') ||
             computedStyle.borderColor.includes('hsl'))) {
          const borderColor = getRgbFromComputedStyle(computedStyle.borderColor);
          el.style.borderColor = borderColor || '#e5e7eb';
        }
      } catch (e) {
        // Ignore errors and continue with other elements
        console.warn('Error processing element styles:', e);
      }
    }
  });
}

/**
 * Helper function to extract RGB values from computed style
 * This handles cases where the browser returns the actual computed RGB values
 */
function getRgbFromComputedStyle(styleValue: string): string | null {
  // If it's already a standard format, return it
  if (styleValue.startsWith('#') ||
      styleValue.startsWith('rgb') ||
      styleValue.startsWith('rgba')) {
    return styleValue;
  }

  // Try to extract RGB values using a temporary element
  try {
    const tempEl = document.createElement('div');
    tempEl.style.color = styleValue;
    document.body.appendChild(tempEl);
    const computedColor = window.getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);
    return computedColor;
  } catch (e) {
    console.warn('Error extracting RGB value:', e);
    return null;
  }
}

interface PDFExportOptions {
  gpxData: GPXData;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  mapRef: React.RefObject<HTMLDivElement>;
  chartsRef: React.RefObject<HTMLDivElement>;
  filename?: string;
}

export async function exportToPDF({
  gpxData,
  forecastPoints,
  weatherData,
  mapRef,
  chartsRef,
  filename,
}: PDFExportOptions): Promise<boolean> {
  if (!gpxData || forecastPoints.length === 0 || weatherData.length === 0) {
    console.error('No data available for PDF export');
    return false;
  }

  try {
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // PDF dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    // Add title
    pdf.setFontSize(24);
    pdf.text('SunRide Weather Forecast Report', margin, 20);

    // Add generation time
    pdf.setFontSize(10);
    const generationDate = new Date().toLocaleString();
    pdf.text(`Generated on ${generationDate}`, margin, 27);

    // Add route info
    pdf.setFontSize(14);
    pdf.text('Route Information', margin, 35);

    pdf.setFontSize(12);
    pdf.text(`Name: ${gpxData.name}`, margin, 42);
    pdf.text(`Total Distance: ${formatDistance(gpxData.totalDistance)}`, margin, 48);
    pdf.text(`Elevation Gain: ${formatElevation(gpxData.elevationGain)}`, margin, 54);
    pdf.text(`Elevation Loss: ${formatElevation(gpxData.elevationLoss)}`, margin, 60);
    pdf.text(`Max Elevation: ${formatElevation(gpxData.maxElevation)}`, margin, 66);
    pdf.text(`Min Elevation: ${formatElevation(gpxData.minElevation)}`, margin, 72);

    // Add map screenshot if map ref is available
    let currentY = 72;
    if (mapRef.current) {
      pdf.text('Route Map', margin, 84);
      currentY = 84;

      try {
        const mapCanvas = await html2canvas(mapRef.current, {
          useCORS: true,
          scale: 2,
          allowTaint: true,
          logging: false,
          onclone: handleModernCssColors,
        });

        const mapImgData = mapCanvas.toDataURL('image/png');
        const mapImgWidth = contentWidth;
        const mapImgHeight = (mapCanvas.height / mapCanvas.width) * mapImgWidth;

        pdf.addImage(mapImgData, 'PNG', margin, 88, mapImgWidth, mapImgHeight);
        currentY = 88 + mapImgHeight;
      } catch (error) {
        console.error('Error capturing map:', error);
        pdf.text('Error capturing map image', margin, 88);
        pdf.text('Please try again or use a different browser', margin, 95);
        currentY = 102;
      }
    }

    // Add charts if available
    if (chartsRef.current) {
      // Check if we need a new page
      if (currentY > pageHeight - 100) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.text('Weather Charts', margin, currentY + 10);

      try {
        // Process the DOM before capturing to handle modern CSS color functions
        const chartsCanvas = await html2canvas(chartsRef.current, {
          useCORS: true,
          scale: 1.5,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: handleModernCssColors,
        });

        const chartsImgData = chartsCanvas.toDataURL('image/png');
        const chartsImgWidth = contentWidth;
        const chartsImgHeight = (chartsCanvas.height / chartsCanvas.width) * chartsImgWidth;

        // Check if charts will fit on current page
        if (currentY + 15 + chartsImgHeight > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
          pdf.text('Weather Charts', margin, currentY);
          pdf.addImage(
            chartsImgData,
            'PNG',
            margin,
            currentY + 5,
            chartsImgWidth,
            chartsImgHeight
          );
        } else {
          pdf.addImage(
            chartsImgData,
            'PNG',
            margin,
            currentY + 15,
            chartsImgWidth,
            chartsImgHeight
          );
        }
      } catch (error) {
        console.error('Error capturing charts:', error);
        pdf.text('Error capturing charts image', margin, currentY + 15);
      }
    }

    // Add weather data table on a new page
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('Weather Forecast Data', margin, 20);

    // Table headers
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Distance', margin, 30);
    pdf.text('Time', margin + 25, 30);
    pdf.text('Temperature', margin + 60, 30);
    pdf.text('Feels Like', margin + 95, 30);
    pdf.text('Wind', margin + 130, 30);
    pdf.text('Precipitation', margin + 155, 30);
    pdf.text('Humidity', margin + 190, 30);

    // Table rows
    pdf.setTextColor(0, 0, 0);
    let rowY = 35;
    const rowHeight = 7;
    const maxRowsPerPage = Math.floor((pageHeight - 40) / rowHeight);

    forecastPoints.forEach((point, index) => {
      const weather = weatherData[index];
      if (!weather) return;

      // Add new page if needed
      if ((index > 0 && index % maxRowsPerPage === 0) || rowY > pageHeight - 20) {
        pdf.addPage();
        rowY = 30;

        // Add headers on new page
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Distance', margin, 20);
        pdf.text('Time', margin + 25, 20);
        pdf.text('Temperature', margin + 60, 20);
        pdf.text('Feels Like', margin + 95, 20);
        pdf.text('Wind', margin + 130, 20);
        pdf.text('Precipitation', margin + 155, 20);
        pdf.text('Humidity', margin + 190, 20);
        pdf.setTextColor(0, 0, 0);
      }

      // Format data
      const distance = `${point.distance.toFixed(1)} km`;
      const time = new Date(point.timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const temp = `${formatTemperature(weather.temperature)}`;
      const feelsLike = `${formatTemperature(weather.feelsLike)}`;
      const wind = `${formatWind(weather.windSpeed)} ${weather.windDirection}°`;
      const precip = `${formatPrecipitation(weather.precipitation || 0)}`;
      const humidity = `${weather.humidity}%`;

      // Draw row
      pdf.text(distance, margin, rowY);
      pdf.text(time, margin + 25, rowY);
      pdf.text(temp, margin + 60, rowY);
      pdf.text(feelsLike, margin + 95, rowY);
      pdf.text(wind, margin + 130, rowY);
      pdf.text(precip, margin + 155, rowY);
      pdf.text(humidity, margin + 190, rowY);

      rowY += rowHeight;
    });

    // Add footer
    pdf.setFontSize(8);
    const footerText = 'Generated by SunRide • Weather data from OpenWeather API';
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, pageWidth - margin - footerWidth, pageHeight - 10);

    // Save PDF with route name and date
    const defaultFilename = `${gpxData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_weather_forecast_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename || defaultFilename);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
