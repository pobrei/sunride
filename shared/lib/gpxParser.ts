import { createReadStream } from 'fs';
import { parseString } from 'xml2js';
import DOMPurify from 'dompurify';

const MAX_FILE_SIZE = 1e6; // 1MB

interface GPXResult {
  gpx: {
    trk: Array<{
      trkseg: Array<{
        trkpt: Array<{
          $: { lat: string; lon: string };
        }>;
      }>;
    }>;
  };
}

const validateGPX = (xml: string): void => {
  if (!xml.match(/<gpx.*version="1\.1"/i)) {
    throw new Error('Invalid GPX version');
  }
  if (!xml.match(/<trkpt/i)) {
    throw new Error('Missing track points');
  }
};

export const parseGPXStream = (filePath: string): Promise<GPXResult> => {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    let xmlData = '';

    stream.on('data', (chunk: Buffer | string) => {
      xmlData += chunk.toString();
      if (xmlData.length > MAX_FILE_SIZE) {
        stream.destroy();
        reject(new Error('File too large'));
      }
    });

    stream.on('end', () => {
      try {
        const sanitizedXML = DOMPurify.sanitize(xmlData);
        validateGPX(sanitizedXML);
        parseString(sanitizedXML, (err: Error | null, result: GPXResult) => {
          if (err) reject(err);
          else resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });

    stream.on('error', reject);
  });
};
