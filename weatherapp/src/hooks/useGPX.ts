'use client';

/**
 * Custom hook for GPX file operations
 */
import { useState, useCallback } from 'react';
import { parseGPX } from '@/utils/gpxParser';
import { GPXData, ValidationError, normalizeGPXData } from '@shared/types/gpx-types';
import { useNotifications } from './useNotifications';

interface UseGPXOptions {
  onSuccess?: (data: GPXData) => void;
  onError?: (error: Error) => void;
  validateGPX?: boolean;
}

/**
 * Hook for handling GPX file operations
 */
export function useGPX(options: UseGPXOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [gpxData, setGpxData] = useState<GPXData | null>(null);

  const { addNotification } = useNotifications();

  /**
   * Validates a GPX file
   */
  const validateGPXFile = useCallback((file: File): boolean => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      throw new ValidationError('Invalid file type. Please upload a GPX file.');
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new ValidationError('File is too large. Maximum size is 10MB.');
    }

    return true;
  }, []);

  /**
   * Loads a GPX file from a File object
   */
  const loadGPXFile = useCallback(async (file: File): Promise<GPXData> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file if option is enabled
      if (options.validateGPX !== false) {
        validateGPXFile(file);
      }

      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      // Parse GPX data
      let data = parseGPX(fileContent);

      // Validate parsed data
      if (!data || !data.points || data.points.length === 0) {
        throw new ValidationError('Invalid GPX file: No route points found');
      }

      // Normalize GPX data
      data = normalizeGPXData(data);

      // Update state and call success callback
      setGpxData(data);
      if (options.onSuccess) {
        options.onSuccess(data);
      }

      addNotification('success', `Route loaded successfully: ${data.name || 'Unnamed route'} (${data.points.length} points)`);

      return data;
    } catch (err) {
      // Handle errors
      const error = err instanceof Error ? err : new Error('Unknown error loading GPX file');
      setError(error);

      if (options.onError) {
        options.onError(error);
      }

      addNotification('error', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options, validateGPXFile, addNotification]);

  /**
   * Loads a GPX file from a URL
   */
  const loadGPXFromURL = useCallback(async (url: string): Promise<GPXData> => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch file content
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch GPX file: ${response.statusText}`);
      }

      const fileContent = await response.text();

      // Parse GPX data
      let data = parseGPX(fileContent);

      // Validate parsed data
      if (!data || !data.points || data.points.length === 0) {
        throw new ValidationError('Invalid GPX file: No route points found');
      }

      // Normalize GPX data
      data = normalizeGPXData(data);

      // Update state and call success callback
      setGpxData(data);
      if (options.onSuccess) {
        options.onSuccess(data);
      }

      addNotification('success', `Route loaded successfully: ${data.name || 'Unnamed route'} (${data.points.length} points)`);

      return data;
    } catch (err) {
      // Handle errors
      const error = err instanceof Error ? err : new Error('Unknown error loading GPX file');
      setError(error);

      if (options.onError) {
        options.onError(error);
      }

      addNotification('error', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options, addNotification]);

  return {
    isLoading,
    error,
    gpxData,
    loadGPXFile,
    loadGPXFromURL,
    setGpxData,
  };
}
