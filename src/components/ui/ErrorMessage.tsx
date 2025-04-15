'use client';

import React from 'react';
import {
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Info,
  ExternalLink,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { typography, animation, effects, status, layout } from '@/styles/tailwind-utils';

type ErrorSeverity = 'error' | 'warning' | 'info';
type ErrorSize = 'sm' | 'md' | 'lg';

interface ErrorMessageProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Optional retry function */
  onRetry?: () => void;
  /** Optional retry button text */
  retryText?: string;
  /** Optional className for styling */
  className?: string;
  /** Whether to show a full-page error */
  fullPage?: boolean;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Size of the error message */
  size?: ErrorSize;
  /** Whether to show a card-like container */
  withContainer?: boolean;
  /** Additional details about the error */
  details?: string;
  /** Whether to show details by default */
  showDetailsDefault?: boolean;
  /** Optional help link */
  helpLink?: string;
  /** Optional help link text */
  helpLinkText?: string;
  /** Optional home button action */
  onGoHome?: () => void;
}

/**
 * A reusable error message component with multiple variants
 */
export function ErrorMessage({
  title,
  message,
  onRetry,
  retryText = 'Try Again',
  className,
  fullPage = false,
  severity = 'error',
  size = 'md',
  withContainer = false,
  details,
  showDetailsDefault = false,
  helpLink,
  helpLinkText = 'Learn More',
  onGoHome,
}: ErrorMessageProps) {
  const [showDetails, setShowDetails] = React.useState(showDetailsDefault);

  // Determine title based on severity if not provided
  const errorTitle =
    title || (severity === 'error' ? 'Error' : severity === 'warning' ? 'Warning' : 'Information');

  // Determine icon based on severity
  let Icon = AlertCircle;
  let variant: 'default' | 'destructive' | 'secondary' = 'default';

  switch (severity) {
    case 'error':
      Icon = XCircle;
      variant = 'destructive';
      break;
    case 'warning':
      Icon = AlertTriangle;
      variant = 'secondary';
      break;
    case 'info':
      Icon = Info;
      variant = 'default';
      break;
  }

  // Determine size classes
  const sizeClasses = {
    sm: cn(typography.bodySm, 'p-3'),
    md: 'p-4',
    lg: cn(typography.bodyLg, 'p-5'),
  }[size];

  const iconSize = { sm: 16, md: 20, lg: 24 }[size];

  const errorContent = (
    <div
      className={cn(
        withContainer && cn(effects.card, 'overflow-hidden'),
        animation.fadeIn,
        className
      )}
      data-testid="error-message"
    >
      <Alert variant={variant} className={cn('flex flex-col items-start', sizeClasses)}>
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-${Math.floor(iconSize / 4)} w-${Math.floor(iconSize / 4)}`} />
            <AlertTitle className={size === 'lg' ? typography.h5 : typography.h6}>
              {errorTitle}
            </AlertTitle>
          </div>
          {details && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          )}
        </div>

        <AlertDescription className={cn(size === 'sm' ? typography.bodySm : typography.body, "mt-2")}>{message}</AlertDescription>

        {details && showDetails && (
          <div className={cn(
            "mt-3 p-3 bg-muted/50 rounded-md font-mono w-full overflow-auto max-h-[200px]",
            typography.code
          )}>
            {details}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {onRetry && (
            <Button
              variant={severity === 'error' ? 'secondary' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
              onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4" />
              {retryText}
            </Button>
          )}

          {helpLink && (
            <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
              <a href={helpLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                {helpLinkText}
              </a>
            </Button>
          )}

          {onGoHome && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={onGoHome}
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );

  if (fullPage) {
    return (
      <div className={cn(layout.flexCenter, "min-h-[50vh] p-4")}>
        <div className="max-w-md w-full">{errorContent}</div>
      </div>
    );
  }

  return errorContent;
}
