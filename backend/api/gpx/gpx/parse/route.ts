import { NextRequest, NextResponse } from 'next/server';
import { parseGPX } from '@shared/utils/gpxParser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('gpxFile') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No GPX file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      return NextResponse.json(
        { message: 'Invalid file type. Please upload a GPX file.' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse GPX data
    const gpxData = parseGPX(fileContent);

    // Validate parsed data
    if (!gpxData.points || gpxData.points.length === 0) {
      return NextResponse.json(
        { message: 'No valid route points found in the GPX file' },
        { status: 400 }
      );
    }

    return NextResponse.json(gpxData);
  } catch (error) {
    console.error('Error parsing GPX file:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to parse GPX file' },
      { status: 500 }
    );
  }
}
