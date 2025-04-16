import { NextRequest, NextResponse } from 'next/server';
import type { ForecastPoint } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Make sure we have valid points
    if (!data.points || !Array.isArray(data.points) || data.points.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request. Points array is required.' 
        },
        { status: 400 }
      );
    }
    
    // Generate mock weather data for each point
    const mockWeatherData = data.points.map((point: ForecastPoint) => {
      // Simple validation
      if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number') {
        return null;
      }
      
      // Generate random weather data
      return {
        temperature: 15 + Math.random() * 10,
        feelsLike: 14 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        pressure: 1000 + Math.random() * 30,
        windSpeed: Math.random() * 20,
        windDirection: Math.random() * 360,
        rain: Math.random() < 0.3 ? Math.random() * 5 : 0,
        snow: 0,
        weatherIcon: '01d',
        weatherDescription: 'Clear sky',
        uvIndex: Math.random() * 10,
        windGust: Math.random() * 30,
        precipitationProbability: Math.random(),
        timestamp: point.timestamp
      };
    });
    
    return NextResponse.json({
      success: true,
      data: mockWeatherData
    });
  } catch (error) {
    console.error('API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}
