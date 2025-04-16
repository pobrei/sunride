'use client';

import { useRef, useCallback, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { GPXData } from '@/types';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { formatDistance, formatDateTime, formatTemperature, formatWind, formatElevation, formatPrecipitation } from '@/utils/helpers';
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
  chartsRef
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
        format: 'a4'
      });

      // PDF dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);

      // Set font to a print-safe font
      pdf.setFont('helvetica', 'normal');

      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(33, 33, 33); // Dark gray for better print contrast
      pdf.text('Weather Forecast Report', margin, 20);

      // Add generation time
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102); // Medium gray for secondary text
      const generationDate = typeof window !== 'undefined'
        ? new Date().toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : new Date().toISOString();
      pdf.text(`Generated on ${generationDate}`, margin, 27);

      // Add route info section with styling
      pdf.setFontSize(16);
      pdf.setTextColor(33, 33, 33);
      pdf.text('Route Information', margin, 35);

      // Add horizontal line
      pdf.setDrawColor(230, 230, 230); // Light gray line
      pdf.line(margin, 37, pageWidth - margin, 37);

      // Route details with better formatting
      pdf.setFontSize(11);
      const routeInfoY = 44;
      const routeInfoSpacing = 7;

      // Draw route name with emphasis
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(33, 33, 33);
      pdf.text(`Route Name:`, margin, routeInfoY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${gpxData.name}`, margin + 30, routeInfoY);

      // Draw distance
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total Distance:`, margin, routeInfoY + routeInfoSpacing);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${formatDistance(gpxData.totalDistance)}`, margin + 30, routeInfoY + routeInfoSpacing);

      // Draw elevation data in two columns
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Elevation Gain:`, margin, routeInfoY + routeInfoSpacing * 2);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${formatElevation(gpxData.elevationGain)}`, margin + 30, routeInfoY + routeInfoSpacing * 2);

      pdf.setFont('helvetica', 'bold');
      pdf.text(`Elevation Loss:`, margin, routeInfoY + routeInfoSpacing * 3);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${formatElevation(gpxData.elevationLoss)}`, margin + 30, routeInfoY + routeInfoSpacing * 3);

      // Second column
      const col2X = pageWidth / 2;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Max Elevation:`, col2X, routeInfoY + routeInfoSpacing * 2);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${formatElevation(gpxData.maxElevation)}`, col2X + 30, routeInfoY + routeInfoSpacing * 2);

      pdf.setFont('helvetica', 'bold');
      pdf.text(`Min Elevation:`, col2X, routeInfoY + routeInfoSpacing * 3);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${formatElevation(gpxData.minElevation)}`, col2X + 30, routeInfoY + routeInfoSpacing * 3);

      // Add map screenshot if map ref is available
      if (mapRef.current) {
        // Add section title with styling
        pdf.setFontSize(16);
        pdf.setTextColor(33, 33, 33);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Route Map', margin, 80);

        // Add horizontal line
        pdf.setDrawColor(230, 230, 230); // Light gray line
        pdf.line(margin, 82, pageWidth - margin, 82);

        // Reset font
        pdf.setFont('helvetica', 'normal');

        // Define mapY and mapImgHeight variables outside the try block
        let mapY = 88; // Default value
        let mapImgHeight = 0;

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
                message.innerHTML = '<strong>Map Preview</strong><br>Interactive map not available in PDF export';

                simplifiedMap.appendChild(message);

                // Replace the map with our simplified version
                if (mapElement.parentNode) {
                  mapElement.parentNode.replaceChild(simplifiedMap, mapElement);
                }
              }

              // Remove any elements with background gradients or complex CSS
              const allElements = clone.querySelectorAll('*');
              allElements.forEach(el => {
                // Ensure we're working with HTMLElement that has style property
                if (el instanceof HTMLElement) {
                  // Simplify CSS to avoid parsing errors
                  el.style.boxShadow = 'none';

                  // Remove gradient backgrounds
                  if (el.style.backgroundImage && el.style.backgroundImage.includes('gradient')) {
                    el.style.backgroundImage = 'none';
                    el.style.backgroundColor = '#ffffff';
                  }

                  // Handle modern color functions that html2canvas doesn't support
                  const computedStyle = window.getComputedStyle(el);
                  const colorProps = ['color', 'backgroundColor', 'borderColor'];

                  colorProps.forEach(prop => {
                    const colorValue = computedStyle[prop as keyof CSSStyleDeclaration] as string;
                    if (colorValue && (
                        colorValue.includes('oklab') ||
                        colorValue.includes('oklch') ||
                        colorValue.includes('hsl(var') ||
                        colorValue.includes('rgb(var')
                      )) {
                      // Replace with a safe color
                      if (prop === 'color') {
                        el.style.color = '#333333';
                      } else if (prop === 'backgroundColor') {
                        el.style.backgroundColor = '#ffffff';
                      } else if (prop === 'borderColor') {
                        el.style.borderColor = '#dddddd';
                      }
                    }
                  });
                }
              });
            },
            ignoreElements: (element) => {
              // Ignore elements that might cause CSS parsing issues
              const hasProblematicClass = element.classList?.contains('ol-control') ||
                                         element.classList?.contains('ol-attribution') ||
                                         element.classList?.contains('ol-scale');

              // Check for elements with complex CSS that might cause issues
              const computedStyle = window.getComputedStyle(element);
              const hasGradient = computedStyle.backgroundImage.includes('gradient');
              const hasComplexTransform = computedStyle.transform !== 'none' &&
                                        computedStyle.transform !== '' &&
                                        element.tagName !== 'CANVAS';

              return hasProblematicClass ||
                     hasGradient ||
                     hasComplexTransform ||
                     element.tagName === 'BUTTON';
            }
          });

          const mapImgData = mapCanvas.toDataURL('image/png');
          const mapImgWidth = contentWidth;
          mapImgHeight = (mapCanvas.height / mapCanvas.width) * mapImgWidth;

          // Update mapY and mapImgHeight with actual values
          mapY = 88;

          // Add a subtle border around the map
          pdf.setDrawColor(220, 220, 220);
          pdf.setFillColor(250, 250, 250);
          pdf.roundedRect(margin - 1, mapY - 1, mapImgWidth + 2, mapImgHeight + 2, 2, 2, 'FD');

          // Add the map image
          pdf.addImage(mapImgData, 'PNG', margin, mapY, mapImgWidth, mapImgHeight);
        } catch (error) {
          console.error('Error capturing map:', error);
          pdf.text('Error capturing map image', margin, 88);
          pdf.text('Please try again or use a different browser', margin, 95);
        }

        // Add chart screenshot if charts ref is available
        if (chartsRef.current) {
          // Check if we need a new page based on remaining space
          // Default to a reasonable height if we couldn't capture the map
          const currentY = mapY + mapImgHeight + 20; // Add some padding after the map
          if (currentY + 60 > pageHeight) {
            pdf.addPage();

            // Add section title with styling
            pdf.setFontSize(16);
            pdf.setTextColor(33, 33, 33);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Weather Charts', margin, 20);

            // Add horizontal line
            pdf.setDrawColor(230, 230, 230);
            pdf.line(margin, 22, pageWidth - margin, 22);

            // Reset font
            pdf.setFont('helvetica', 'normal');

            try {
              const chartsCanvas = await html2canvas(chartsRef.current, {
                useCORS: true,
                scale: 1.5,
                allowTaint: true,
                logging: false,
                ignoreElements: (element) => {
                  // Ignore elements that might cause CSS parsing issues
                  const hasProblematicClass = element.classList?.contains('scroll-area-scrollbar') ||
                                             element.classList?.contains('scroll-area-thumb');

                  // Check for elements with complex CSS that might cause issues
                  const computedStyle = window.getComputedStyle(element);
                  const hasGradient = computedStyle.backgroundImage.includes('gradient');
                  const hasComplexTransform = computedStyle.transform !== 'none' &&
                                            computedStyle.transform !== '' &&
                                            element.tagName !== 'CANVAS';

                  return hasProblematicClass ||
                         hasGradient ||
                         hasComplexTransform ||
                         element.tagName === 'BUTTON';
                },
                onclone: (document, clone) => {
                  // Remove any elements with background gradients or complex CSS
                  const allElements = clone.querySelectorAll('*');
                  allElements.forEach(el => {
                    // Ensure we're working with HTMLElement that has style property
                    if (el instanceof HTMLElement) {
                      // Simplify CSS to avoid parsing errors
                      el.style.boxShadow = 'none';

                      // Remove gradient backgrounds
                      if (el.style.backgroundImage && el.style.backgroundImage.includes('gradient')) {
                        el.style.backgroundImage = 'none';
                        el.style.backgroundColor = '#ffffff';
                      }

                      // Handle modern color functions that html2canvas doesn't support
                      const computedStyle = window.getComputedStyle(el);
                      const colorProps = ['color', 'backgroundColor', 'borderColor'];

                      colorProps.forEach(prop => {
                        const colorValue = computedStyle[prop as keyof CSSStyleDeclaration] as string;
                        if (colorValue && (
                            colorValue.includes('oklab') ||
                            colorValue.includes('oklch') ||
                            colorValue.includes('hsl(var') ||
                            colorValue.includes('rgb(var')
                          )) {
                          // Replace with a safe color
                          if (prop === 'color') {
                            el.style.color = '#333333';
                          } else if (prop === 'backgroundColor') {
                            el.style.backgroundColor = '#ffffff';
                          } else if (prop === 'borderColor') {
                            el.style.borderColor = '#dddddd';
                          }
                        }
                      });
                    }
                  });
                }
              });

              const chartsImgData = chartsCanvas.toDataURL('image/png');
              const chartsImgWidth = contentWidth;
              const chartsImgHeight = (chartsCanvas.height / chartsCanvas.width) * chartsImgWidth;

              // Add some padding after the title
              const chartsY = 30;

              // Add a subtle border around the charts
              pdf.setDrawColor(220, 220, 220);
              pdf.setFillColor(250, 250, 250);
              pdf.roundedRect(margin - 1, chartsY - 1, chartsImgWidth + 2, chartsImgHeight + 2, 2, 2, 'FD');

              // Add the charts image
              pdf.addImage(chartsImgData, 'PNG', margin, chartsY, chartsImgWidth, chartsImgHeight);
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
              const chartsCanvas = await html2canvas(chartsRef.current, {
                useCORS: true,
                scale: 1.5,
                allowTaint: true,
                logging: false,
                ignoreElements: (element) => {
                  // Ignore elements that might cause CSS parsing issues
                  return element.tagName === 'BUTTON' ||
                         element.classList?.contains('scroll-area-scrollbar') ||
                         element.classList?.contains('scroll-area-thumb');
                }
              });

              const chartsImgData = chartsCanvas.toDataURL('image/png');
              const chartsImgWidth = contentWidth;
              const chartsImgHeight = (chartsCanvas.height / chartsCanvas.width) * chartsImgWidth;

              pdf.addImage(chartsImgData, 'PNG', margin, currentY + 5, chartsImgWidth, chartsImgHeight);
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

      // Add detailed forecast table with better styling
      pdf.setFontSize(16);
      pdf.setTextColor(33, 33, 33);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detailed Weather Forecast', margin, 20);

      // Add horizontal line
      pdf.setDrawColor(230, 230, 230);
      pdf.line(margin, 22, pageWidth - margin, 22);

      // Table headers with improved styling
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(80, 80, 80);

      const col1Width = 38;
      const col2Width = 33;
      const colWidth = 22;

      let yPos = 30;

      // Add subtle background for the header row
      pdf.setFillColor(245, 247, 250);
      pdf.rect(margin, yPos - 5, pageWidth - (margin * 2), 10, 'F');

      pdf.text('Time', margin, yPos);
      pdf.text('Distance', margin + col1Width, yPos);
      pdf.text('Temp (°C)', margin + col1Width + col2Width, yPos);
      pdf.text('Wind', margin + col1Width + col2Width + colWidth, yPos);
      pdf.text('Precip (mm)', margin + col1Width + col2Width + colWidth * 2, yPos);
      pdf.text('Humidity (%)', margin + col1Width + col2Width + colWidth * 3, yPos);

      // Draw header line
      pdf.setDrawColor(200, 200, 200);
      yPos += 2;
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;

      // Reset text color for data rows
      pdf.setTextColor(50, 50, 50);

      // Table rows
      pdf.setFont('helvetica', 'normal');

      // Add zebra striping for better readability
      let isEvenRow = false;

      for (let i = 0; i < forecastPoints.length; i++) {
        const point = forecastPoints[i];
        const weather = weatherData[i];

        if (!weather) continue;

        // Check if we need a new page
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;

          // Add headers on new page with styling
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(80, 80, 80);

          // Add subtle background for the header row
          pdf.setFillColor(245, 247, 250);
          pdf.rect(margin, yPos - 5, pageWidth - (margin * 2), 10, 'F');

          pdf.text('Time', margin, yPos);
          pdf.text('Distance', margin + col1Width, yPos);
          pdf.text('Temp (°C)', margin + col1Width + col2Width, yPos);
          pdf.text('Wind', margin + col1Width + col2Width + colWidth, yPos);
          pdf.text('Precip (mm)', margin + col1Width + col2Width + colWidth * 2, yPos);
          pdf.text('Humidity (%)', margin + col1Width + col2Width + colWidth * 3, yPos);

          // Draw header line
          pdf.setDrawColor(200, 200, 200);
          yPos += 2;
          pdf.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 5;

          // Reset text color for data rows
          pdf.setTextColor(50, 50, 50);
          pdf.setFont('helvetica', 'normal');
          isEvenRow = false;
        }

        // Add zebra striping for better readability
        if (isEvenRow) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPos - 5, pageWidth - (margin * 2), 7, 'F');
        }
        isEvenRow = !isEvenRow;

        // Add row data
        pdf.text(formatDateTime(point.timestamp), margin, yPos);
        pdf.text(formatDistance(point.distance), margin + col1Width, yPos);

        // Highlight temperature with color based on value
        const temp = weather.temperature;
        if (temp > 30) {
          pdf.setTextColor(220, 50, 50); // Hot - red
        } else if (temp > 25) {
          pdf.setTextColor(230, 100, 50); // Warm - orange
        } else if (temp < 5) {
          pdf.setTextColor(50, 100, 220); // Cold - blue
        } else {
          pdf.setTextColor(50, 50, 50); // Normal - dark gray
        }
        pdf.text(formatTemperature(temp), margin + col1Width + col2Width, yPos);
        pdf.setTextColor(50, 50, 50); // Reset color

        pdf.text(formatWind(weather.windSpeed, weather.windDirection), margin + col1Width + col2Width + colWidth, yPos);
        pdf.text(formatPrecipitation(weather.rain), margin + col1Width + col2Width + colWidth * 2, yPos);
        pdf.text(`${weather.humidity}%`, margin + col1Width + col2Width + colWidth * 3, yPos);

        // Draw row separator (lighter than header)
        pdf.setDrawColor(230, 230, 230);
        yPos += 2;
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      }

      // Add footer with styling
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);

      // Add footer line
      pdf.setDrawColor(230, 230, 230);
      pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

      // Add footer text
      const footerText = 'Generated by RideWeather Planner • Data from OpenWeather API';
      const footerWidth = pdf.getTextWidth(footerText);
      pdf.text(footerText, pageWidth - margin - footerWidth, pageHeight - 10);

      // Add page number on each page
      const totalPages = pdf.getNumberOfPages();

      // Go through all pages to add page numbers
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text(`Page ${i} of ${totalPages}`, margin, pageHeight - 10);
      }

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
      className="border-border/50 hover:bg-primary/5 transition-colors shadow-sm rounded-lg"
    >
      {isExporting ? (
        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
      ) : (
        <div className="bg-primary/10 p-1 rounded-full">
          <FileDown className="h-4 w-4 text-primary" />
        </div>
      )}
    </Button>
  );
}