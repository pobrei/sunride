'use client';

import { useCallback, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface PDFExportProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  mapRef: React.RefObject<HTMLDivElement>;
  chartsRef: React.RefObject<HTMLDivElement>;
}

export default function PDFExport({
  gpxData,
  forecastPoints,
  weatherData,
  mapRef,
  chartsRef,
}: PDFExportProps) {
  // State for export status
  const [isExporting, setIsExporting] = useState(false);

  // Generate PDF with route info, map screenshot, and weather forecast
  const generatePDF = useCallback(async (): Promise<boolean> => {
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
      pdf.text('Weather Forecast Report', margin, 20);

      // Add generation time
      pdf.setFontSize(10);
      const generationDate =
        typeof window !== 'undefined' ? new Date().toLocaleString() : new Date().toISOString();
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
      if (mapRef.current) {
        pdf.text('Route Map', margin, 84);

        try {
          const mapCanvas = await html2canvas(mapRef.current, {
            useCORS: true,
            scale: 2,
            allowTaint: true,
            logging: false,
            onclone: (document, clone) => {
              // Find and modify problematic elements in the cloned document
              const mapElement = clone.querySelector('[class*="ol-"]')?.parentElement;
              if (mapElement) {
                // Create a simplified version of the map for export
                const simplifiedMap = document.createElement('div');
                simplifiedMap.style.width = '100%';
                simplifiedMap.style.height = '100%';
                simplifiedMap.style.backgroundColor = '#f3f4f6';
                simplifiedMap.style.position = 'relative';
                simplifiedMap.style.borderRadius = '0.75rem';
                simplifiedMap.style.overflow = 'hidden';

                // Add a message
                const message = document.createElement('div');
                message.style.position = 'absolute';
                message.style.top = '50%';
                message.style.left = '50%';
                message.style.transform = 'translate(-50%, -50%)';
                message.style.textAlign = 'center';
                message.style.color = '#6b7280';
                message.style.padding = '1rem';
                message.innerHTML =
                  '<strong>Map Preview</strong><br>Interactive map not available in PDF export';

                simplifiedMap.appendChild(message);

                // Replace the map with our simplified version
                mapElement.parentNode.replaceChild(simplifiedMap, mapElement);
              }
            },
            ignoreElements: element => {
              // Ignore elements that might cause CSS parsing issues
              return (
                element.classList?.contains('ol-control') ||
                element.classList?.contains('ol-attribution') ||
                element.classList?.contains('ol-scale') ||
                element.tagName === 'CANVAS' ||
                element.tagName === 'BUTTON'
              );
            },
          });

          const mapImgData = mapCanvas.toDataURL('image/png');
          const mapImgWidth = contentWidth;
          const mapImgHeight = (mapCanvas.height / mapCanvas.width) * mapImgWidth;

          pdf.addImage(mapImgData, 'PNG', margin, 88, mapImgWidth, mapImgHeight);
        } catch (error) {
          console.error('Error capturing map:', error);
          pdf.text('Error capturing map image', margin, 88);
          pdf.text('Please try again or use a different browser', margin, 95);
        }

        // Add chart screenshot if charts ref is available
        if (chartsRef.current) {
          // Check if we need a new page based on remaining space
          // Default to a reasonable height if we couldn't capture the map
          const currentY = 88 + 150; // Use a default height
          if (currentY + 60 > pageHeight) {
            pdf.addPage();
            pdf.text('Weather Charts', margin, 20);

            try {
              // Pre-process the charts to handle unsupported color functions
              const preprocessCharts = (node: HTMLElement) => {
                // Convert all oklab colors to RGB to avoid html2canvas parsing errors
                const elementsWithStyle = node.querySelectorAll('*');
                elementsWithStyle.forEach(el => {
                  if (el instanceof HTMLElement) {
                    const style = window.getComputedStyle(el);
                    // Apply computed styles directly to avoid color function parsing issues
                    el.style.backgroundColor = style.backgroundColor;
                    el.style.color = style.color;
                    el.style.borderColor = style.borderColor;
                  }
                });
              };

              // Apply preprocessing to the charts
              if (chartsRef.current) {
                preprocessCharts(chartsRef.current);
              }

              const chartsCanvas = await html2canvas(chartsRef.current, {
                useCORS: true,
                scale: 1.5,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (document, clone) => {
                  // Find and process chart elements in the cloned document
                  const chartElements = clone.querySelectorAll('[class*="chart"]');
                  chartElements.forEach(el => {
                    if (el instanceof HTMLElement) {
                      // Apply computed styles directly
                      el.style.backgroundColor = '#ffffff';
                    }
                  });
                },
                ignoreElements: element => {
                  // Ignore elements that might cause CSS parsing issues
                  return (
                    element.tagName === 'BUTTON' ||
                    element.classList?.contains('scroll-area-scrollbar') ||
                    element.classList?.contains('scroll-area-thumb')
                  );
                },
              });

              const chartsImgData = chartsCanvas.toDataURL('image/png');
              const chartsImgWidth = contentWidth;
              const chartsImgHeight = (chartsCanvas.height / chartsCanvas.width) * chartsImgWidth;

              pdf.addImage(chartsImgData, 'PNG', margin, 25, chartsImgWidth, chartsImgHeight);
            } catch (error) {
              console.error('Error capturing charts:', error);
              pdf.text('Error capturing charts image', margin, 25);
              pdf.text('Please try again or use a different browser', margin, 32);
            }

            // Add forecast table on a new page
            pdf.addPage();
          } else {
            // Add charts on the same page
            pdf.text('Weather Charts', margin, currentY);

            try {
              // Pre-process the charts to handle unsupported color functions
              const preprocessCharts = (node: HTMLElement) => {
                // Convert all oklab colors to RGB to avoid html2canvas parsing errors
                const elementsWithStyle = node.querySelectorAll('*');
                elementsWithStyle.forEach(el => {
                  if (el instanceof HTMLElement) {
                    const style = window.getComputedStyle(el);
                    // Apply computed styles directly to avoid color function parsing issues
                    el.style.backgroundColor = style.backgroundColor;
                    el.style.color = style.color;
                    el.style.borderColor = style.borderColor;
                  }
                });
              };

              // Apply preprocessing to the charts
              if (chartsRef.current) {
                preprocessCharts(chartsRef.current);
              }

              const chartsCanvas = await html2canvas(chartsRef.current, {
                useCORS: true,
                scale: 1.5,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (document, clone) => {
                  // Find and process chart elements in the cloned document
                  const chartElements = clone.querySelectorAll('[class*="chart"]');
                  chartElements.forEach(el => {
                    if (el instanceof HTMLElement) {
                      // Apply computed styles directly
                      el.style.backgroundColor = '#ffffff';
                    }
                  });
                },
                ignoreElements: element => {
                  // Ignore elements that might cause CSS parsing issues
                  return (
                    element.tagName === 'BUTTON' ||
                    element.classList?.contains('scroll-area-scrollbar') ||
                    element.classList?.contains('scroll-area-thumb')
                  );
                },
              });

              const chartsImgData = chartsCanvas.toDataURL('image/png');
              const chartsImgWidth = contentWidth;
              const chartsImgHeight = (chartsCanvas.height / chartsCanvas.width) * chartsImgWidth;

              pdf.addImage(
                chartsImgData,
                'PNG',
                margin,
                currentY + 5,
                chartsImgWidth,
                chartsImgHeight
              );
            } catch (error) {
              console.error('Error capturing charts:', error);
              pdf.text('Error capturing charts image', margin, currentY + 5);
              pdf.text('Please try again or use a different browser', margin, currentY + 12);
            }

            // Add forecast table on a new page
            pdf.addPage();
          }
        } else {
          // No charts, add forecast table on a new page
          pdf.addPage();
        }
      }

      // Add detailed forecast table
      pdf.setFontSize(14);
      pdf.text('Detailed Weather Forecast', margin, 20);

      // Table headers
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');

      const col1Width = 38;
      const col2Width = 33;
      const colWidth = 22;

      let yPos = 30;

      pdf.text('Time', margin, yPos);
      pdf.text('Distance', margin + col1Width, yPos);
      pdf.text('Temp (°C)', margin + col1Width + col2Width, yPos);
      pdf.text('Wind', margin + col1Width + col2Width + colWidth, yPos);
      pdf.text('Precip (mm)', margin + col1Width + col2Width + colWidth * 2, yPos);
      pdf.text('Humidity (%)', margin + col1Width + col2Width + colWidth * 3, yPos);

      // Draw header line
      yPos += 2;
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;

      // Table rows
      pdf.setFont('helvetica', 'normal');

      for (let i = 0; i < forecastPoints.length; i++) {
        const point = forecastPoints[i];
        const weather = weatherData[i];

        if (!weather) continue;

        // Check if we need a new page
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;

          // Add headers on new page
          pdf.setFont('helvetica', 'bold');
          pdf.text('Time', margin, yPos);
          pdf.text('Distance', margin + col1Width, yPos);
          pdf.text('Temp (°C)', margin + col1Width + col2Width, yPos);
          pdf.text('Wind', margin + col1Width + col2Width + colWidth, yPos);
          pdf.text('Precip (mm)', margin + col1Width + col2Width + colWidth * 2, yPos);
          pdf.text('Humidity (%)', margin + col1Width + col2Width + colWidth * 3, yPos);

          // Draw header line
          yPos += 2;
          pdf.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 5;
          pdf.setFont('helvetica', 'normal');
        }

        pdf.text(formatDateTime(point.timestamp), margin, yPos);
        pdf.text(formatDistance(point.distance), margin + col1Width, yPos);
        pdf.text(formatTemperature(weather.temperature), margin + col1Width + col2Width, yPos);
        pdf.text(
          formatWind(weather.windSpeed, weather.windDirection),
          margin + col1Width + col2Width + colWidth,
          yPos
        );
        pdf.text(
          formatPrecipitation(weather.rain),
          margin + col1Width + col2Width + colWidth * 2,
          yPos
        );
        pdf.text(`${weather.humidity}%`, margin + col1Width + col2Width + colWidth * 3, yPos);

        // Draw row line
        yPos += 2;
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      }

      // Add footer
      pdf.setFontSize(8);
      const footerText = 'Generated by Weather Planner App • Data from OpenWeather API';
      const footerWidth = pdf.getTextWidth(footerText);
      pdf.text(footerText, pageWidth - margin - footerWidth, pageHeight - 10);

      // Save PDF with route name and date
      const filename = `${gpxData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_weather_forecast_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    }
  }, [gpxData, forecastPoints, weatherData, mapRef, chartsRef]);

  // Handle export button click
  const handleExport = async () => {
    if (!gpxData || forecastPoints.length === 0 || weatherData.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      await generatePDF();
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleExport}
      disabled={isExporting || !gpxData || forecastPoints.length === 0}
      aria-label="Export as PDF"
      title="Export as PDF"
    >
      {isExporting ? (
        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
    </Button>
  );
}
