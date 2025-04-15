import { parseGPX } from '@/features/gpx/utils/gpxParser';

describe('GPX Parser Error Handling', () => {
  it('should throw an error for empty GPX content', () => {
    const emptyGPX = '';

    expect(() => parseGPX(emptyGPX)).toThrow();
  });

  it('should throw an error for invalid XML', () => {
    const invalidXML = '<gpx><invalid>';

    expect(() => parseGPX(invalidXML)).toThrow();
  });

  it('should throw an error for non-GPX XML', () => {
    const nonGPXXML = '<someOtherTag><content>Not a GPX file</content></someOtherTag>';

    expect(() => parseGPX(nonGPXXML)).toThrow();
  });

  it('should throw an error for GPX without track points', () => {
    const gpxWithoutPoints = `
      <?xml version="1.0" encoding="UTF-8"?>
      <gpx version="1.1" creator="Test App">
        <metadata>
          <name>Empty Route</name>
          <time>2023-01-01T12:00:00Z</time>
        </metadata>
        <trk>
          <name>Empty Track</name>
          <trkseg>
            <!-- No track points -->
          </trkseg>
        </trk>
      </gpx>
    `;

    expect(() => parseGPX(gpxWithoutPoints)).toThrow();
  });

  it('should throw an error for GPX with invalid coordinates', () => {
    const gpxWithInvalidCoords = `
      <?xml version="1.0" encoding="UTF-8"?>
      <gpx version="1.1" creator="Test App">
        <metadata>
          <name>Invalid Route</name>
          <time>2023-01-01T12:00:00Z</time>
        </metadata>
        <trk>
          <name>Invalid Track</name>
          <trkseg>
            <trkpt lat="invalid" lon="-122.3321">
              <ele>100</ele>
              <time>2023-01-01T12:00:00Z</time>
            </trkpt>
          </trkseg>
        </trk>
      </gpx>
    `;

    expect(() => parseGPX(gpxWithInvalidCoords)).toThrow();
  });

  it('should throw an error for GPX with invalid time format', () => {
    const gpxWithInvalidTime = `
      <?xml version="1.0" encoding="UTF-8"?>
      <gpx version="1.1" creator="Test App">
        <metadata>
          <name>Invalid Time Route</name>
          <time>2023-01-01T12:00:00Z</time>
        </metadata>
        <trk>
          <name>Invalid Time Track</name>
          <trkseg>
            <trkpt lat="47.6062" lon="-122.3321">
              <ele>100</ele>
              <time>not-a-valid-time</time>
            </trkpt>
          </trkseg>
        </trk>
      </gpx>
    `;

    expect(() => parseGPX(gpxWithInvalidTime)).toThrow();
  });

  it('should handle GPX with missing elevation data', () => {
    const gpxWithoutElevation = `
      <?xml version="1.0" encoding="UTF-8"?>
      <gpx version="1.1" creator="Test App">
        <metadata>
          <name>No Elevation Route</name>
          <time>2023-01-01T12:00:00Z</time>
        </metadata>
        <trk>
          <name>No Elevation Track</name>
          <trkseg>
            <trkpt lat="47.6062" lon="-122.3321">
              <time>2023-01-01T12:00:00Z</time>
            </trkpt>
          </trkseg>
        </trk>
      </gpx>
    `;

    // Should not throw, but should set elevation to 0
    const result = parseGPX(gpxWithoutElevation);
    expect(result.points[0].elevation).toBe(0);
  });
});
