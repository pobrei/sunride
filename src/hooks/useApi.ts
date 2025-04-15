import { useState, useCallback } from 'react';
import { useSimpleNotifications } from '@/features/notifications/context';
import {
  APIError,
  NetworkError,
  ValidationError,
  AuthError,
  PermissionError,
  NotFoundError,
  RateLimitError,
  parseError,
} from '@/utils/errorHandling';
import { captureException } from '@/lib/sentry';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface ApiOptions {
  /** Whether to show error notifications automatically */
  showErrorNotifications?: boolean;
  /** Whether to show success notifications automatically */
  showSuccessNotifications?: boolean;
  /** Success message to show (if showSuccessNotifications is true) */
  successMessage?: string;
  /** Whether to capture errors in Sentry */
  captureSentryErrors?: boolean;
  /** Additional headers to include in the request */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to include credentials in the request */
  withCredentials?: boolean;
}

const defaultOptions: ApiOptions = {
  showErrorNotifications: true,
  showSuccessNotifications: false,
  captureSentryErrors: true,
  timeout: 30000,
  withCredentials: true,
};

/**
 * Custom hook for making API requests with proper error handling
 *
 * @param initialData - Initial data to use before the first request
 * @param options - API request options
 * @returns API state and request functions
 */
export function useApi<T>(initialData: T | null = null, options: ApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const { addNotification } = useSimpleNotifications();
  const mergedOptions = { ...defaultOptions, ...options };

  /**
   * Handles API errors and shows notifications if enabled
   */
  const handleError = useCallback(
    (error: unknown) => {
      const parsedError = parseError(error);

      // Show error notification if enabled
      if (mergedOptions.showErrorNotifications) {
        addNotification('error', parsedError.message);
      }

      // Capture error in Sentry if enabled
      if (mergedOptions.captureSentryErrors) {
        captureException(error, {
          context: 'useApi',
          extra: {
            parsedError,
          },
        });
      }

      // Return the error for further handling
      if (error instanceof Error) {
        return error;
      }

      // Convert unknown errors to Error objects
      return new Error(parsedError.message);
    },
    [addNotification, mergedOptions]
  );

  /**
   * Makes a GET request to the specified URL
   */
  const get = useCallback(
    async (url: string, customOptions: RequestInit = {}) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout);

        // Prepare headers
        const headers = new Headers({
          'Content-Type': 'application/json',
          ...(mergedOptions.headers || {}),
          ...(customOptions.headers || {}),
        });

        // Make the request
        const response = await fetch(url, {
          method: 'GET',
          headers,
          credentials: mergedOptions.withCredentials ? 'include' : undefined,
          signal: controller.signal,
          ...customOptions,
        });

        // Clear timeout
        clearTimeout(timeoutId);

        // Handle non-2xx responses
        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          let errorData;

          try {
            errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Ignore JSON parsing errors
          }

          // Throw appropriate error based on status code
          switch (response.status) {
            case 400:
              throw new ValidationError(errorMessage, errorData);
            case 401:
              throw new AuthError(errorMessage, errorData);
            case 403:
              throw new PermissionError(errorMessage, errorData);
            case 404:
              throw new NotFoundError(errorMessage, errorData);
            case 429:
              throw new RateLimitError(errorMessage, errorData);
            default:
              throw new APIError(errorMessage, response.status, errorData);
          }
        }

        // Parse response
        const data = (await response.json()) as T;

        // Show success notification if enabled
        if (mergedOptions.showSuccessNotifications && mergedOptions.successMessage) {
          addNotification('success', mergedOptions.successMessage);
        }

        // Update state with data
        setState({
          data,
          isLoading: false,
          error: null,
        });

        return data;
      } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('NetworkError')) {
          error = new NetworkError('Network error. Please check your internet connection.');
        }

        // Handle timeout errors
        if (error instanceof DOMException && error.name === 'AbortError') {
          error = new NetworkError('Request timed out. Please try again later.');
        }

        // Handle and transform error
        const transformedError = handleError(error);

        // Update state with error
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: transformedError,
        }));

        throw transformedError;
      }
    },
    [addNotification, handleError, mergedOptions]
  );

  /**
   * Makes a POST request to the specified URL
   */
  const post = useCallback(
    async (url: string, data: unknown, customOptions: RequestInit = {}) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout);

        // Prepare headers
        const headers = new Headers({
          'Content-Type': 'application/json',
          ...(mergedOptions.headers || {}),
          ...(customOptions.headers || {}),
        });

        // Make the request
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          credentials: mergedOptions.withCredentials ? 'include' : undefined,
          signal: controller.signal,
          ...customOptions,
        });

        // Clear timeout
        clearTimeout(timeoutId);

        // Handle non-2xx responses
        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          let errorData;

          try {
            errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Ignore JSON parsing errors
          }

          // Throw appropriate error based on status code
          switch (response.status) {
            case 400:
              throw new ValidationError(errorMessage, errorData);
            case 401:
              throw new AuthError(errorMessage, errorData);
            case 403:
              throw new PermissionError(errorMessage, errorData);
            case 404:
              throw new NotFoundError(errorMessage, errorData);
            case 429:
              throw new RateLimitError(errorMessage, errorData);
            default:
              throw new APIError(errorMessage, response.status, errorData);
          }
        }

        // Parse response
        const responseData = (await response.json()) as T;

        // Show success notification if enabled
        if (mergedOptions.showSuccessNotifications && mergedOptions.successMessage) {
          addNotification('success', mergedOptions.successMessage);
        }

        // Update state with data
        setState({
          data: responseData,
          isLoading: false,
          error: null,
        });

        return responseData;
      } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('NetworkError')) {
          error = new NetworkError('Network error. Please check your internet connection.');
        }

        // Handle timeout errors
        if (error instanceof DOMException && error.name === 'AbortError') {
          error = new NetworkError('Request timed out. Please try again later.');
        }

        // Handle and transform error
        const transformedError = handleError(error);

        // Update state with error
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: transformedError,
        }));

        throw transformedError;
      }
    },
    [addNotification, handleError, mergedOptions]
  );

  /**
   * Makes a PUT request to the specified URL
   */
  const put = useCallback(
    async (url: string, data: unknown, customOptions: RequestInit = {}) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout);

        // Prepare headers
        const headers = new Headers({
          'Content-Type': 'application/json',
          ...(mergedOptions.headers || {}),
          ...(customOptions.headers || {}),
        });

        // Make the request
        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
          credentials: mergedOptions.withCredentials ? 'include' : undefined,
          signal: controller.signal,
          ...customOptions,
        });

        // Clear timeout
        clearTimeout(timeoutId);

        // Handle non-2xx responses
        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          let errorData;

          try {
            errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Ignore JSON parsing errors
          }

          // Throw appropriate error based on status code
          switch (response.status) {
            case 400:
              throw new ValidationError(errorMessage, errorData);
            case 401:
              throw new AuthError(errorMessage, errorData);
            case 403:
              throw new PermissionError(errorMessage, errorData);
            case 404:
              throw new NotFoundError(errorMessage, errorData);
            case 429:
              throw new RateLimitError(errorMessage, errorData);
            default:
              throw new APIError(errorMessage, response.status, errorData);
          }
        }

        // Parse response
        const responseData = (await response.json()) as T;

        // Show success notification if enabled
        if (mergedOptions.showSuccessNotifications && mergedOptions.successMessage) {
          addNotification('success', mergedOptions.successMessage);
        }

        // Update state with data
        setState({
          data: responseData,
          isLoading: false,
          error: null,
        });

        return responseData;
      } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('NetworkError')) {
          error = new NetworkError('Network error. Please check your internet connection.');
        }

        // Handle timeout errors
        if (error instanceof DOMException && error.name === 'AbortError') {
          error = new NetworkError('Request timed out. Please try again later.');
        }

        // Handle and transform error
        const transformedError = handleError(error);

        // Update state with error
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: transformedError,
        }));

        throw transformedError;
      }
    },
    [addNotification, handleError, mergedOptions]
  );

  /**
   * Makes a DELETE request to the specified URL
   */
  const del = useCallback(
    async (url: string, customOptions: RequestInit = {}) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout);

        // Prepare headers
        const headers = new Headers({
          'Content-Type': 'application/json',
          ...(mergedOptions.headers || {}),
          ...(customOptions.headers || {}),
        });

        // Make the request
        const response = await fetch(url, {
          method: 'DELETE',
          headers,
          credentials: mergedOptions.withCredentials ? 'include' : undefined,
          signal: controller.signal,
          ...customOptions,
        });

        // Clear timeout
        clearTimeout(timeoutId);

        // Handle non-2xx responses
        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          let errorData;

          try {
            errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Ignore JSON parsing errors
          }

          // Throw appropriate error based on status code
          switch (response.status) {
            case 400:
              throw new ValidationError(errorMessage, errorData);
            case 401:
              throw new AuthError(errorMessage, errorData);
            case 403:
              throw new PermissionError(errorMessage, errorData);
            case 404:
              throw new NotFoundError(errorMessage, errorData);
            case 429:
              throw new RateLimitError(errorMessage, errorData);
            default:
              throw new APIError(errorMessage, response.status, errorData);
          }
        }

        // Parse response if it exists
        let responseData: T | null = null;

        if (
          response.headers.get('Content-Length') !== '0' &&
          response.headers.get('Content-Type')?.includes('application/json')
        ) {
          responseData = (await response.json()) as T;
        }

        // Show success notification if enabled
        if (mergedOptions.showSuccessNotifications && mergedOptions.successMessage) {
          addNotification('success', mergedOptions.successMessage);
        }

        // Update state with data
        setState({
          data: responseData,
          isLoading: false,
          error: null,
        });

        return responseData;
      } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('NetworkError')) {
          error = new NetworkError('Network error. Please check your internet connection.');
        }

        // Handle timeout errors
        if (error instanceof DOMException && error.name === 'AbortError') {
          error = new NetworkError('Request timed out. Please try again later.');
        }

        // Handle and transform error
        const transformedError = handleError(error);

        // Update state with error
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: transformedError,
        }));

        throw transformedError;
      }
    },
    [addNotification, handleError, mergedOptions]
  );

  /**
   * Resets the API state
   */
  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
    });
  }, [initialData]);

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
    reset,
  };
}
