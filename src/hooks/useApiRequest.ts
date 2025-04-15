'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  safeFetch,
  safeJsonFetch,
  ApiError,
  ApiErrorType,
  reportApiError,
} from '@/utils/apiErrorHandler';
import { useSimpleNotifications } from '@/features/notifications/context';

interface ApiRequestState<T> {
  /** The data returned from the API */
  data: T | null;
  /** Whether the request is currently loading */
  isLoading: boolean;
  /** Any error that occurred during the request */
  error: ApiError | Error | null;
  /** Whether the request was successful */
  isSuccess: boolean;
}

interface ApiRequestOptions {
  /** Whether to show error notifications automatically */
  showErrorNotifications?: boolean;
  /** Whether to show success notifications automatically */
  showSuccessNotifications?: boolean;
  /** Success message to show (if showSuccessNotifications is true) */
  successMessage?: string;
  /** Whether to report errors to monitoring service */
  reportErrors?: boolean;
  /** Context for error reporting */
  errorContext?: string;
  /** Whether to execute the request automatically on mount */
  executeOnMount?: boolean;
  /** Dependencies that trigger a re-fetch when changed (when executeOnMount is true) */
  dependencies?: any[];
  /** Whether to retry failed requests automatically */
  retry?: boolean;
  /** Maximum number of retries */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
}

const defaultOptions: ApiRequestOptions = {
  showErrorNotifications: true,
  showSuccessNotifications: false,
  successMessage: 'Request completed successfully',
  reportErrors: true,
  errorContext: 'api-request',
  executeOnMount: false,
  retry: false,
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * Hook for making API requests with built-in error handling
 * @param url - URL to fetch (can be a function that returns a URL)
 * @param options - Request options
 * @returns API request state and functions
 */
export function useApiRequest<T = any>(
  url: string | (() => string | null),
  options?: ApiRequestOptions & RequestInit
): ApiRequestState<T> & {
  execute: (customOptions?: RequestInit) => Promise<T | null>;
  reset: () => void;
} {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const { addNotification } = useSimpleNotifications();
  const mergedOptions: ApiRequestOptions = { ...defaultOptions, ...options };

  // Extract fetch options from merged options
  const {
    showErrorNotifications,
    showSuccessNotifications,
    successMessage,
    reportErrors,
    errorContext,
    executeOnMount,
    dependencies,
    retry,
    maxRetries,
    retryDelay,
    ...fetchOptions
  } = mergedOptions;

  // Function to execute the request
  const execute = useCallback(
    async (customOptions?: RequestInit): Promise<T | null> => {
      // Get the URL (which might be a function)
      const resolvedUrl = typeof url === 'function' ? url() : url;

      // If URL is null or empty, don't execute
      if (!resolvedUrl) {
        return null;
      }

      // Merge custom options with default options
      const requestOptions = { ...fetchOptions, ...customOptions };

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      let retryCount = 0;
      let lastError: ApiError | Error | null = null;

      // Retry loop
      while (retryCount <= (retry ? maxRetries! : 0)) {
        try {
          // Execute the request
          const data = await safeJsonFetch<T>(resolvedUrl, requestOptions);

          // Update state with success
          setState({
            data,
            isLoading: false,
            error: null,
            isSuccess: true,
          });

          // Show success notification if enabled
          if (showSuccessNotifications && successMessage) {
            addNotification('success', successMessage);
          }

          return data;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');

          // If we've exhausted retries or retry is disabled, handle the error
          if (retryCount === maxRetries || !retry) {
            // Report error if enabled
            if (reportErrors) {
              reportApiError(error, errorContext || 'useApiRequest');
            }

            // Show error notification if enabled
            if (showErrorNotifications) {
              const errorMessage =
                error instanceof ApiError
                  ? error.message
                  : error instanceof Error
                    ? error.message
                    : 'An unknown error occurred';

              addNotification('error', errorMessage);
            }

            // Update state with error
            setState({
              data: null,
              isLoading: false,
              error: lastError,
              isSuccess: false,
            });

            break;
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay! * Math.pow(2, retryCount)));
          retryCount++;
        }
      }

      return null;
    },
    [
      url,
      fetchOptions,
      showErrorNotifications,
      showSuccessNotifications,
      successMessage,
      reportErrors,
      errorContext,
      retry,
      maxRetries,
      retryDelay,
      addNotification,
    ]
  );

  // Reset the state
  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  // Execute on mount if enabled
  useEffect(() => {
    if (executeOnMount) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies || []);

  return {
    ...state,
    execute,
    reset,
  };
}
