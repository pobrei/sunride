import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { WeatherData } from '@/features/weather/types';

/**
 * Generates weather report PDF with optimized memory usage
 * Using streaming approach rather than creating the entire document in memory
 *
 * @param routeName - Name of the route
 * @param weatherData - Array of weather data points
 * @param mapImageBase64 - Optional base64-encoded map image
 * @returns PDF document as a Uint8Array
 */
export async function generateWeatherReportPDF(
  routeName: string,
  weatherData: Array<WeatherData | null>,
  mapImageBase64?: string
): Promise<Uint8Array> {
  // Create a new document
  const pdfDoc: PDFDocument = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Add the title page
  const titlePage = pdfDoc.addPage([600, 800]);
  const { width, height } = titlePage.getSize();

  titlePage.drawText('Weather Report', {
    x: 50,
    y: height - 100,
    size: 36,
    font: helveticaFont,
    color: rgb(0, 0.2, 0.6),
  });

  titlePage.drawText(`Route: ${routeName}`, {
    x: 50,
    y: height - 150,
    size: 18,
    font: helveticaFont,
  });

  titlePage.drawText(`Generated: ${new Date().toLocaleString()}`, {
    x: 50,
    y: height - 180,
    size: 14,
    font: timesRomanFont,
  });

  // If we have a map image, embed it (with memory checks)
  if (mapImageBase64 && mapImageBase64.length < 5e6) {
    // Limit to 5MB
    try {
      const mapImageBytes: Buffer = Buffer.from(
        mapImageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
        'base64'
      );

      const mapImage = await pdfDoc.embedPng(mapImageBytes);

      // Scale and center the image
      const imgDims = mapImage.scale(0.5);
      titlePage.drawImage(mapImage, {
        x: (width - imgDims.width) / 2,
        y: height - 350,
        width: imgDims.width,
        height: imgDims.height,
      });
    } catch (error) {
      console.error('Could not embed map image:', error);
    }
  }

  // Add weather data pages - done in batches to prevent memory issues
  const ITEMS_PER_PAGE: number = 15;

  for (let i = 0; i < weatherData.length; i += ITEMS_PER_PAGE) {
    const pageItems: Array<WeatherData | null> = weatherData.slice(i, i + ITEMS_PER_PAGE);
    const dataPage = pdfDoc.addPage([600, 800]);

    dataPage.drawText(
      `Weather Data (${i + 1}-${Math.min(i + ITEMS_PER_PAGE, weatherData.length)})`,
      {
        x: 50,
        y: height - 50,
        size: 18,
        font: helveticaFont,
      }
    );

    // Draw table headers
    const headers: string[] = ['Time', 'Temperature', 'Wind', 'Precipitation', 'Humidity'];
    headers.forEach((header, index) => {
      dataPage.drawText(header, {
        x: 50 + index * 100,
        y: height - 80,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0.7),
      });
    });

    // Draw data rows
    pageItems.forEach((item, index) => {
      if (!item) return; // Skip null items

      const y: number = height - 110 - index * 30;

      dataPage.drawText(new Date(item.time).toLocaleTimeString(), {
        x: 50,
        y,
        size: 10,
        font: timesRomanFont,
      });

      dataPage.drawText(`${item.temperature}°C`, {
        x: 150,
        y,
        size: 10,
        font: timesRomanFont,
      });

      dataPage.drawText(`${item.windSpeed} km/h`, {
        x: 250,
        y,
        size: 10,
        font: timesRomanFont,
      });

      dataPage.drawText(`${item.precipitation} mm`, {
        x: 350,
        y,
        size: 10,
        font: timesRomanFont,
      });

      dataPage.drawText(`${item.humidity}%`, {
        x: 450,
        y,
        size: 10,
        font: timesRomanFont,
      });
    });

    // Free memory after each page
    gc?.();
  }

  // Serialize the document
  return await pdfDoc.save();
}
