/**
 * Enhanced file validation utilities with magic number checking
 */

// File type magic numbers (first few bytes that identify file types)
const FILE_SIGNATURES = {
  // XML files (GPX files are XML)
  XML: [
    [0x3c, 0x3f, 0x78, 0x6d], // <?xml
    [0x3c, 0x67, 0x70, 0x78], // <gpx
    [0xef, 0xbb, 0xbf, 0x3c], // UTF-8 BOM + <
  ],
} as const;

/**
 * Check if array starts with given signature
 */
function matchesSignature(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;

  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false;
  }

  return true;
}

/**
 * Validate file type using magic numbers
 */
export async function validateFileType(file: File, expectedType: 'gpx' | 'xml'): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);

        // Check for XML/GPX signatures
        if (expectedType === 'gpx' || expectedType === 'xml') {
          const isValidXML = FILE_SIGNATURES.XML.some(signature =>
            matchesSignature(bytes, signature)
          );

          if (isValidXML) {
            // Additional check for GPX content
            if (expectedType === 'gpx') {
              const textContent = new TextDecoder().decode(bytes.slice(0, 1024));
              const hasGPXContent =
                textContent.toLowerCase().includes('<gpx') ||
                textContent.toLowerCase().includes('gpx');
              resolve(hasGPXContent);
            } else {
              resolve(true);
            }
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Unknown error'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));

    // Read first 1KB for validation
    reader.readAsArrayBuffer(file.slice(0, 1024));
  });
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate file extension
 */
export function validateFileExtension(file: File, allowedExtensions: string[]): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Comprehensive file validation
 */
export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedExtensions?: string[];
  requireMagicNumber?: boolean;
  expectedType?: 'gpx' | 'xml';
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validateFile(
  file: File,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> {
  const {
    maxSizeMB = 10,
    allowedExtensions = ['gpx', 'xml'],
    requireMagicNumber = true,
    expectedType = 'gpx',
  } = options;

  const result: FileValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Check file size
  if (!validateFileSize(file, maxSizeMB)) {
    result.errors.push(`File size exceeds ${maxSizeMB}MB limit`);
    result.isValid = false;
  }

  // Check file extension
  if (!validateFileExtension(file, allowedExtensions)) {
    result.errors.push(`File extension must be one of: ${allowedExtensions.join(', ')}`);
    result.isValid = false;
  }

  // Check magic number if required
  if (requireMagicNumber && result.isValid) {
    try {
      const isValidType = await validateFileType(file, expectedType);
      if (!isValidType) {
        result.errors.push(`File does not appear to be a valid ${expectedType.toUpperCase()} file`);
        result.isValid = false;
      }
    } catch {
      result.errors.push('Failed to validate file content');
      result.isValid = false;
    }
  }

  // Add warnings for edge cases
  if (file.size > 5 * 1024 * 1024) {
    // 5MB
    result.warnings.push('Large file detected - processing may take longer');
  }

  if (file.name.includes(' ')) {
    result.warnings.push('File name contains spaces - consider using underscores or hyphens');
  }

  return result;
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}

/**
 * Extract basic file metadata
 */
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  extension: string;
  sanitizedName: string;
}

export function extractFileMetadata(file: File): FileMetadata {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified),
    extension,
    sanitizedName: sanitizeFileName(file.name),
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
