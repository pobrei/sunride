import { NextRequest, NextResponse } from 'next/server';
import { getWeatherForecast, getMultipleForecastPoints } from '@/lib/weatherAPI';
import type { ForecastPoint } from '@/lib/weatherAPI';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Make sure we have valid points
    if (!data.points || !Array.isArray(data.points) || data.points.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Points array is required.' },
        { status: 400 }
      );
    }
    
    // Validate each point
    const forecastPoints = data.points as ForecastPoint[];
    for (const point of forecastPoints) {
      if (
        typeof point.lat !== 'number' || 
        typeof point.lon !== 'number' || 
        typeof point.timestamp !== 'number' || 
        typeof point.distance !== 'number'
      ) {
        return NextResponse.json(
          { error: 'Invalid point data. Each point must have lat, lon, timestamp, and distance as numbers.' },
          { status: 400 }
        );
      }
    }
    
    // Get weather data for all points
    const weatherData = await getMultipleForecastPoints(forecastPoints);
    
    return NextResponse.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');
    const timestamp = parseInt(searchParams.get('timestamp') || '', 10);
    const distance = parseFloat(searchParams.get('distance') || '');
    
    // Validate params
    if (isNaN(lat) || isNaN(lon) || isNaN(timestamp) || isNaN(distance)) {
      return NextResponse.json(
        { error: 'Invalid parameters. lat, lon, timestamp, and distance are required and must be numbers.' },
        { status: 400 }
      );
    }
    
    // Get weather data for this point
    const point: ForecastPoint = { lat, lon, timestamp, distance };
    const weatherData = await getWeatherForecast(point);
    
    if (!weatherData) {
      return NextResponse.json(
        { error: 'Failed to fetch weather data for the given point.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
} 