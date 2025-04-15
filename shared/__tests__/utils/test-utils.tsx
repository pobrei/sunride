import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { WeatherProvider } from '@frontend/context/WeatherContext';
import { NotificationProvider, SafeDataProvider } from '@frontend/components/providers';

// Define a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withWeatherProvider?: boolean;
  withNotificationProvider?: boolean;
  withSafeDataProvider?: boolean;
}

/**
 * Custom render function that wraps components with necessary providers
 *
 * @param ui - The component to render
 * @param options - Render options
 * @returns The rendered component with testing utilities
 */
function customRender(
  ui: ReactElement,
  {
    withWeatherProvider = true,
    withNotificationProvider = true,
    withSafeDataProvider = true,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Create a wrapper with the requested providers
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let wrappedChildren = children;

    // Add providers from innermost to outermost
    if (withSafeDataProvider) {
      wrappedChildren = <SafeDataProvider>{wrappedChildren}</SafeDataProvider>;
    }

    if (withWeatherProvider) {
      wrappedChildren = <WeatherProvider>{wrappedChildren}</WeatherProvider>;
    }

    if (withNotificationProvider) {
      wrappedChildren = <NotificationProvider>{wrappedChildren}</NotificationProvider>;
    }

    return <>{wrappedChildren}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the render method
export { customRender as render };
