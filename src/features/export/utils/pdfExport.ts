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
function handleModernCssColors(document: Document, clone: DocumentFragment): void {
  try {
    // Apply inline styles to all elements
    const elementsWithStyles = clone.querySelectorAll('*');
    elementsWithStyles.forEach(el => {
      if (el instanceof HTMLElement) {
        try {
          // Skip marker elements to preserve their styling
          const isMarker = el.classList.contains('marker-normal') ||
                          el.classList.contains('marker-selected') ||
                          el.classList.contains('custom-marker-icon') ||
                          el.closest('.leaflet-marker-icon');

          if (!isMarker) {
            // Apply safe styles directly to each element
            el.style.setProperty('color', '#000000', 'important');
            el.style.setProperty('background-color', '#ffffff', 'important');
            el.style.setProperty('border-color', '#e5e7eb', 'important');
            el.style.setProperty('box-shadow', 'none', 'important');
            el.style.setProperty('text-shadow', 'none', 'important');

            // Remove any problematic styles
            el.style.removeProperty('background-image');
            el.style.removeProperty('background-gradient');
          } else {
            // For markers, just fix any oklch colors but preserve the styling
            if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) {
              if (el.classList.contains('marker-normal')) {
                el.style.backgroundColor = '#ffffff';
                el.style.color = '#000000';
                el.style.borderRadius = '50%';
              } else if (el.classList.contains('marker-selected')) {
                el.style.backgroundColor = '#00C2A8'; // Primary color
                el.style.color = '#ffffff';
                el.style.borderRadius = '50%';
              }
            }
          }

          // Handle SVG elements specially
          if (el.tagName.toLowerCase() === 'svg' || el.closest('svg')) {
            if (el.hasAttribute('fill') && el.getAttribute('fill')?.includes('oklch')) {
              el.setAttribute('fill', '#000000');
            }
            if (el.hasAttribute('stroke') && el.getAttribute('stroke')?.includes('oklch')) {
              el.setAttribute('stroke', '#000000');
            }
          }
        } catch (e) {
          // Ignore errors and continue with other elements
          console.warn('Error processing element styles:', e);
        }
      }
    });

    console.log('Successfully applied style overrides to cloned document');
  } catch (e) {
    console.error('Error in handleModernCssColors:', e);
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
        // Create a simplified version of the map for export
        const mapContainer = mapRef.current;

        // Pre-process the map container to remove problematic styles
        if (mapContainer) {
          const allElements = mapContainer.querySelectorAll('*');
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              // Check if this is a marker element
              const isMarker = el.classList.contains('marker-normal') ||
                              el.classList.contains('marker-selected') ||
                              el.classList.contains('custom-marker-icon') ||
                              el.closest('.leaflet-marker-icon');

              if (!isMarker) {
                // Apply safe styles to non-marker elements
                el.style.color = '#000000';
                el.style.backgroundColor = '#ffffff';
                el.style.borderColor = '#e5e7eb';
              } else {
                // For markers, ensure they have the correct styling
                if (el.classList.contains('marker-normal')) {
                  // Normal marker styling
                  el.style.display = 'flex';
                  el.style.alignItems = 'center';
                  el.style.justifyContent = 'center';
                  el.style.width = '28px';
                  el.style.height = '28px';
                  el.style.backgroundColor = '#ffffff';
                  el.style.color = '#000000';
                  el.style.fontWeight = '500';
                  el.style.border = '2px solid #e5e7eb';
                  el.style.borderRadius = '50%';
                  el.style.fontSize = '12px';
                  el.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                } else if (el.classList.contains('marker-selected')) {
                  // Selected marker styling
                  el.style.display = 'flex';
                  el.style.alignItems = 'center';
                  el.style.justifyContent = 'center';
                  el.style.width = '40px';
                  el.style.height = '40px';
                  el.style.backgroundColor = '#00C2A8'; // Primary color
                  el.style.color = '#ffffff';
                  el.style.fontWeight = '600';
                  el.style.border = 'none';
                  el.style.borderRadius = '50%';
                  el.style.fontSize = '14px';
                  el.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }
              }
            }
          });
        }

        // First try with a simplified approach
        const mapCanvas = await html2canvas(mapContainer, {
          useCORS: true,
          scale: 2,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: handleModernCssColors,
          ignoreElements: (element) => {
            // Ignore elements that might cause issues
            return element.classList?.contains('leaflet-control-attribution') ||
                   element.classList?.contains('leaflet-control-scale') ||
                   element.tagName === 'BUTTON';
          },
          // Force a white background and black text
          foreignObjectRendering: false,
        });

        const mapImgData = mapCanvas.toDataURL('image/png');
        const mapImgWidth = contentWidth;
        const mapImgHeight = (mapCanvas.height / mapCanvas.width) * mapImgWidth;

        pdf.addImage(mapImgData, 'PNG', margin, 88, mapImgWidth, mapImgHeight);
        currentY = 88 + mapImgHeight;
      } catch (error) {
        console.error('Error capturing map:', error);

        // Add text explaining the map couldn't be captured
        pdf.text('Route map could not be captured due to browser limitations.', margin, 88);
        pdf.text('Please view the map in the web application.', margin, 95);

        // Add a simple placeholder rectangle
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(245, 245, 245);
        pdf.roundedRect(margin, 102, contentWidth, 100, 3, 3, 'FD');

        // Add some text in the placeholder
        pdf.setFontSize(14);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Map Preview Not Available', margin + contentWidth/2 - 40, 152);

        // Update the current Y position
        currentY = 212;
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
        // Create a simplified version of the charts for export
        const chartsContainer = chartsRef.current;

        // Pre-process the charts container to remove problematic styles
        if (chartsContainer) {
          const allElements = chartsContainer.querySelectorAll('*');
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              // Check if this is a marker element (unlikely in charts, but just in case)
              const isMarker = el.classList.contains('marker-normal') ||
                              el.classList.contains('marker-selected') ||
                              el.classList.contains('custom-marker-icon') ||
                              el.closest('.leaflet-marker-icon');

              if (!isMarker) {
                // Apply safe styles to non-marker elements
                el.style.color = '#000000';
                el.style.backgroundColor = '#ffffff';
                el.style.borderColor = '#e5e7eb';

                // Handle SVG elements
                if (el.tagName.toLowerCase() === 'svg' || el.closest('svg')) {
                  if (el.hasAttribute('fill')) {
                    // Preserve some chart colors
                    if (el.classList.contains('recharts-rectangle') ||
                        el.classList.contains('recharts-area') ||
                        el.classList.contains('recharts-line') ||
                        el.classList.contains('recharts-curve')) {
                      // Don't change fill for chart elements
                    } else {
                      el.setAttribute('fill', '#000000');
                    }
                  }
                  if (el.hasAttribute('stroke')) {
                    // Preserve some chart colors
                    if (el.classList.contains('recharts-curve') ||
                        el.classList.contains('recharts-line-curve') ||
                        el.classList.contains('recharts-area-curve')) {
                      // Don't change stroke for chart elements
                    } else {
                      el.setAttribute('stroke', '#000000');
                    }
                  }
                }
              } else {
                // For markers, ensure they have the correct styling
                if (el.classList.contains('marker-normal')) {
                  // Normal marker styling
                  el.style.display = 'flex';
                  el.style.alignItems = 'center';
                  el.style.justifyContent = 'center';
                  el.style.width = '28px';
                  el.style.height = '28px';
                  el.style.backgroundColor = '#ffffff';
                  el.style.color = '#000000';
                  el.style.fontWeight = '500';
                  el.style.border = '2px solid #e5e7eb';
                  el.style.borderRadius = '50%';
                  el.style.fontSize = '12px';
                  el.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                } else if (el.classList.contains('marker-selected')) {
                  // Selected marker styling
                  el.style.display = 'flex';
                  el.style.alignItems = 'center';
                  el.style.justifyContent = 'center';
                  el.style.width = '40px';
                  el.style.height = '40px';
                  el.style.backgroundColor = '#00C2A8'; // Primary color
                  el.style.color = '#ffffff';
                  el.style.fontWeight = '600';
                  el.style.border = 'none';
                  el.style.borderRadius = '50%';
                  el.style.fontSize = '14px';
                  el.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }
              }
            }
          });
        }

        // Try a different approach for charts
        // First, create a simplified version by taking a screenshot of just the container
        const chartsCanvas = await html2canvas(chartsContainer, {
          useCORS: true,
          scale: 1.5,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: handleModernCssColors,
          ignoreElements: (element) => {
            // Ignore elements that might cause issues
            return element.classList?.contains('scroll-area-scrollbar') ||
                   element.classList?.contains('scroll-area-thumb') ||
                   element.tagName === 'BUTTON';
          },
          removeContainer: false,
          foreignObjectRendering: false,
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

        // Just add text explaining the charts couldn't be captured
        pdf.text('Weather charts could not be captured due to browser limitations.', margin, currentY + 15);
        pdf.text('Please view the charts in the web application.', margin, currentY + 22);

        // Add a simple placeholder rectangle
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(245, 245, 245);
        pdf.roundedRect(margin, currentY + 30, contentWidth, 100, 3, 3, 'FD');

        // Add some text in the placeholder
        pdf.setFontSize(14);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Charts Preview Not Available', margin + contentWidth/2 - 40, currentY + 80);

        // Update the current Y position
        currentY += 140;
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
