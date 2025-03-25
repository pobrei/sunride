'use client';

import { useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { GPXData } from '@/utils/gpxParser';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { formatDistance, formatDateTime, formatTemperature, formatWind, formatElevation, formatPrecipitation } from '@/utils/helpers';

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
      
      // Add title
      pdf.setFontSize(24);
      pdf.text('Weather Forecast Report', margin, 20);
      
      // Add generation time
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, margin, 27);
      
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
        
        const mapCanvas = await html2canvas(mapRef.current, {
          useCORS: true,
          scale: 2,
          allowTaint: true
        });
        
        const mapImgData = mapCanvas.toDataURL('image/png');
        const mapImgWidth = contentWidth;
        const mapImgHeight = (mapCanvas.height / mapCanvas.width) * mapImgWidth;
        
        pdf.addImage(mapImgData, 'PNG', margin, 88, mapImgWidth, mapImgHeight);
        
        // Add chart screenshot if charts ref is available
        if (chartsRef.current) {
          // Check if we need a new page based on remaining space
          const currentY = 88 + mapImgHeight + 10;
          if (currentY + 60 > pageHeight) {
            pdf.addPage();
            pdf.text('Weather Charts', margin, 20);
            
            const chartsCanvas = await html2canvas(chartsRef.current, {
              useCORS: true,
              scale: 1.5,
              allowTaint: true
            });
            
            const chartsImgData = chartsCanvas.toDataURL('image/png');
            const chartsImgWidth = contentWidth;
            const chartsImgHeight = (chartsCanvas.height / chartsCanvas.width) * chartsImgWidth;
            
            pdf.addImage(chartsImgData, 'PNG', margin, 25, chartsImgWidth, chartsImgHeight);
            
            // Add forecast table on a new page
            pdf.addPage();
          } else {
            // Add charts on the same page
            pdf.text('Weather Charts', margin, currentY);
            
            const chartsCanvas = await html2canvas(chartsRef.current, {
              useCORS: true,
              scale: 1.5,
              allowTaint: true
            });
            
            const chartsImgData = chartsCanvas.toDataURL('image/png');
            const chartsImgWidth = contentWidth;
            const chartsImgHeight = (chartsCanvas.height / chartsCanvas.width) * chartsImgWidth;
            
            pdf.addImage(chartsImgData, 'PNG', margin, currentY + 5, chartsImgWidth, chartsImgHeight);
            
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
        pdf.text(formatWind(weather.windSpeed, weather.windDirection), margin + col1Width + col2Width + colWidth, yPos);
        pdf.text(formatPrecipitation(weather.rain), margin + col1Width + col2Width + colWidth * 2, yPos);
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

  return {
    generatePDF
  };
} 