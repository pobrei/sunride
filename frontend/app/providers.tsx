'use client';

import React, { ReactNode, useEffect } from 'react';

// Import from feature folders
import { WeatherProvider } from '@frontend/features/weather/context';
import { NotificationProvider, SimpleNotificationProvider } from '@frontend/features/notifications/context';
import { SafeDataProvider } from '@frontend/features/data-validation/context';

// Import from components
import { ErrorBoundary } from '@frontend/components/common';
import { ThemeProvider } from '@frontend/components/providers/theme-provider';
import { PerformanceProvider } from '@frontend/components/providers/performance-provider';
import { ToastProvider } from '@frontend/components/ui/toast';
import { KeyboardFocusOutline } from '@frontend/components/ui/KeyboardFocusOutline';

// Import from lib
import { initSentry } from '@shared/lib/sentry';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Initialize Sentry on the client side
  useEffect(() => {
    initSentry();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <PerformanceProvider>
          <KeyboardFocusOutline />
          <ToastProvider>
          <NotificationProvider>
            <SimpleNotificationProvider>
              <SafeDataProvider>
                <WeatherProvider>{children}</WeatherProvider>
              </SafeDataProvider>
            </SimpleNotificationProvider>
          </NotificationProvider>
          </ToastProvider>
        </PerformanceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
