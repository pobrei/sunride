'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FallbackUIProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

/**
 * Fallback UI component for error boundaries
 */
const FallbackUI: React.FC<FallbackUIProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        We encountered an unexpected error. Please try refreshing the page or contact support if the
        problem persists.
      </p>
      {error && (
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Error details
          </summary>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-w-md">
            {error.message}
          </pre>
        </details>
      )}
      <Button onClick={resetErrorBoundary} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
};

export default FallbackUI;
