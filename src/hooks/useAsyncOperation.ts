'use client';

import { useState, useCallback } from 'react';
import { useSimpleNotifications } from '@/features/notifications/context';
import { captureException } from '@/features/monitoring';

interface AsyncOperationState<T> {
  /** The result of the operation */
  result: T | null;
  /** Whether the operation is currently loading */
  isLoading: boolean;
  /** Any error that occurred during the operation */
  error: Error | null;
  /** Whether the operation was successful */
  isSuccess: boolean;
}

interface AsyncOperationOptions {
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
}

const defaultOptions: AsyncOperationOptions = {
  showErrorNotifications: true,
  showSuccessNotifications: false,
  successMessage: 'Operation completed successfully',
  reportErrors: true,
  errorContext: 'async-operation',
};

/**
 * Hook for handling async operations with loading and error states
 * @returns Async operation state and execute function
 */
export function useAsyncOperation<T = any, P extends any[] = any[]>(
  operation: (...args: P) => Promise<T>,
  options?: AsyncOperationOptions
): AsyncOperationState<T> & {
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
} {
  const [state, setState] = useState<AsyncOperationState<T>>({
    result: null,
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const { addNotification } = useSimpleNotifications();
  const mergedOptions: AsyncOperationOptions = { ...defaultOptions, ...options };

  // Function to execute the operation
  const execute = useCallback(async (...args: P): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Execute the operation
      const result = await operation(...args);
      
      // Update state with success
      setState({
        result,
        isLoading: false,
        error: null,
        isSuccess: true,
      });
      
      // Show success notification if enabled
      if (mergedOptions.showSuccessNotifications && mergedOptions.successMessage) {
        addNotification('success', mergedOptions.successMessage);
      }
      
      return result;
    } catch (error) {
      // Convert error to Error object
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      
      // Report error if enabled
      if (mergedOptions.reportErrors) {
        captureException(errorObj, {
          tags: { context: mergedOptions.errorContext },
          extra: { args }
        });
      }
      
      // Show error notification if enabled
      if (mergedOptions.showErrorNotifications) {
        addNotification('error', errorObj.message);
      }
      
      // Update state with error
      setState({
        result: null,
        isLoading: false,
        error: errorObj,
        isSuccess: false,
      });
      
      return null;
    }
  }, [operation, mergedOptions, addNotification]);

  // Reset the state
  const reset = useCallback(() => {
    setState({
      result: null,
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
