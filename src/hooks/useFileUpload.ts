import { useState, useCallback } from 'react';
import { useSimpleNotifications } from '@/features/notifications/context';
import { ValidationError, tryCatch } from '@/utils';
import { captureException } from '@/features/monitoring';

interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: Error | null;
}

interface FileUploadOptions {
  /** Allowed file types (MIME types) */
  allowedTypes?: string[];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Whether to show error notifications automatically */
  showErrorNotifications?: boolean;
  /** Whether to show success notifications automatically */
  showSuccessNotifications?: boolean;
  /** Success message to show (if showSuccessNotifications is true) */
  successMessage?: string;
  /** Whether to capture errors in Sentry */
  captureSentryErrors?: boolean;
}

const defaultOptions: FileUploadOptions = {
  allowedTypes: ['application/gpx+xml', 'application/xml', 'text/xml'],
  maxSize: 10 * 1024 * 1024, // 10MB
  showErrorNotifications: true,
  showSuccessNotifications: true,
  successMessage: 'File uploaded successfully',
  captureSentryErrors: true,
};

/**
 * Custom hook for handling file uploads with error handling
 *
 * @param options - File upload options
 * @returns File upload state and functions
 */
export function useFileUpload(options: FileUploadOptions = {}): {
  state: FileUploadState;
  uploadFile: (file: File, url: string) => Promise<string>;
  parseGPXFile: (file: File) => Promise<string>;
  reset: () => void;
} {
  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const { addNotification } = useSimpleNotifications();
  const mergedOptions: FileUploadOptions = { ...defaultOptions, ...options };

  /**
   * Validates a file before upload
   */
  const validateFile = useCallback((file: File): void => {
    // Check file type
    if (mergedOptions.allowedTypes && mergedOptions.allowedTypes.length > 0) {
      const isValidType: boolean = mergedOptions.allowedTypes.some(type => {
        // Handle wildcards like 'application/*'
        if (type.endsWith('/*')) {
          const prefix: string = type.split('/*')[0];
          return file.type.startsWith(prefix);
        }
        return file.type === type;
      });

      if (!isValidType) {
        throw new ValidationError(`Invalid file type. Allowed types: ${mergedOptions.allowedTypes.join(', ')}`);
      }
    }

    // Check file size
    if (mergedOptions.maxSize && file.size > mergedOptions.maxSize) {
      const maxSizeMB: number = Math.round(mergedOptions.maxSize / (1024 * 1024));
      throw new ValidationError(`File is too large. Maximum size is ${maxSizeMB}MB`);
    }
  }, [mergedOptions]);

  /**
   * Uploads a file to the specified URL
   */
  const uploadFile = useCallback(async (file: File, url: string): Promise<string> => {
    setState({
      isUploading: true,
      progress: 0,
      error: null,
    });

    try {
      // Validate file
      validateFile(file);

      // Create form data
      const formData: FormData = new FormData();
      formData.append('file', file);

      // Create XMLHttpRequest for progress tracking
      const xhr: XMLHttpRequest = new XMLHttpRequest();

      // Create promise to handle the upload
      const uploadPromise: Promise<string> = new Promise<string>((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: number = Math.round((event.loaded / event.total) * 100);
            setState(prev => ({ ...prev, progress }));
          }
        });

        // Handle successful upload
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response: { url?: string; fileUrl?: string; filePath?: string } = JSON.parse(xhr.responseText);
              resolve(response.url || response.fileUrl || response.filePath || xhr.responseText);
            } catch {
              resolve(xhr.responseText);
            }
          } else {
            let errorMessage = `Upload failed with status ${xhr.status}`;
            try {
              const response: { message?: string } = JSON.parse(xhr.responseText);
              errorMessage = response.message || errorMessage;
            } catch {
              // Ignore JSON parsing errors
            }
            reject(new Error(errorMessage));
          }
        });

        // Handle upload errors
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during file upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('File upload was aborted'));
        });

        // Open and send the request
        xhr.open('POST', url);
        xhr.send(formData);
      });

      // Wait for upload to complete
      const result = await uploadPromise;

      // Show success notification if enabled
      if (mergedOptions.showSuccessNotifications && mergedOptions.successMessage) {
        addNotification('success', mergedOptions.successMessage);
      }

      // Update state
      setState({
        isUploading: false,
        progress: 100,
        error: null,
      });

      return result;
    } catch (error) {
      // Handle and show error
      if (mergedOptions.showErrorNotifications) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred during file upload';
        addNotification('error', message);
      }

      // Capture error in Sentry if enabled
      if (mergedOptions.captureSentryErrors) {
        captureException(error, {
          context: 'useFileUpload',
          extra: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          },
        });
      }

      // Update state with error
      const errorObj = error instanceof Error ? error : new Error('An unknown error occurred during file upload');
      setState({
        isUploading: false,
        progress: 0,
        error: errorObj,
      });

      throw errorObj;
    }
  }, [addNotification, mergedOptions, validateFile]);

  /**
   * Parses a GPX file and returns the parsed data
   */
  const parseGPXFile = useCallback(async (file: File): Promise<string> => {
    return await tryCatch(async () => {
      // Validate file
      validateFile(file);

      // Read file as text
      const text: string = await new Promise<string>((resolve, reject) => {
        const reader: FileReader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
      });

      // Validate GPX content with more detailed checks
      if (!text.includes('<gpx')) {
        throw new ValidationError('Not a valid GPX file: Missing <gpx> tag');
      }

      if (!text.includes('</gpx>')) {
        throw new ValidationError('Not a valid GPX file: Missing closing </gpx> tag');
      }

      // Check for track or route points
      if (!text.includes('<trkpt') && !text.includes('<rtept')) {
        throw new ValidationError('GPX file contains no track or route points');
      }

      // Check for potential XML parsing issues
      if (text.includes('<?xml') && !text.includes('<?xml version=')) {
        throw new ValidationError('Malformed XML declaration in GPX file');
      }

      // Check for potentially corrupted file
      if (text.length > 0 && text.trim().length === 0) {
        throw new ValidationError('GPX file appears to be empty or contains only whitespace');
      }

      return text;
    }, (error) => {
      // Handle and show error
      if (mergedOptions.showErrorNotifications) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred while parsing the file';
        addNotification('error', message);
      }

      // Capture error in Sentry if enabled
      if (mergedOptions.captureSentryErrors) {
        captureException(error, {
          context: 'useFileUpload.parseGPXFile',
          extra: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          },
        });
      }

      // Update state with error
      const errorObj = error instanceof Error ? error : new Error('An unknown error occurred while parsing the file');
      setState(prev => ({
        ...prev,
        error: errorObj,
      }));

      throw errorObj;
    }) || '';
  }, [addNotification, mergedOptions, validateFile]);

  /**
   * Resets the file upload state
   */
  const reset = useCallback((): void => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  return {
    ...state,
    uploadFile,
    parseGPXFile,
    reset,
  };
}
