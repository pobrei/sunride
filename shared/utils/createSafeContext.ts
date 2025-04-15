'use client';

import { createContext, useContext } from 'react';

/**
 * Creates a context with a safe hook that doesn't throw when used outside of provider
 * @param defaultValue - Default value to use when hook is called outside provider
 * @returns Object with context, provider, and safe hook
 */
export function createSafeContext<T>(defaultValue: T | null = null) {
  const Context = createContext<T | null>(defaultValue);

  /**
   * Safe hook that returns default value when used outside provider
   */
  const useSafeContext = () => {
    return useContext(Context);
  };

  return {
    Context,
    Provider: Context.Provider,
    useSafeContext,
  };
}

/**
 * Type for a function that does nothing
 */
type NoopFunction = (...args: any[]) => void;

/**
 * Creates a noop function that does nothing
 * @returns Function that does nothing
 */
export function noop(): NoopFunction {
  return () => {};
}
