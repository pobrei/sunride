'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { effects, status, animation } from '@shared/styles/tailwind-utils';

export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackMessageProps {
  /** The type of feedback message */
  type: FeedbackType;
  /** The message to display */
  message: string;
  /** Whether the message is dismissible */
  dismissible?: boolean;
  /** Callback when the message is dismissed */
  onDismiss?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Whether the message should be announced to screen readers */
  announceToScreenReader?: boolean;
  /** ID for the message (for ARIA purposes) */
  id?: string;
}

/**
 * A reusable feedback message component for success, error, info, and warning messages
 */
export function FeedbackMessage({
  type,
  message,
  dismissible = true,
  onDismiss,
  className,
  announceToScreenReader = true,
  id,
}: FeedbackMessageProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // If not visible, don't render
  if (!isVisible) {
    return null;
  }

  // Determine icon and styles based on type
  const iconMap = {
    success: <CheckCircle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
  };

  const statusMap = {
    success: status.success,
    error: status.error,
    warning: status.warning,
    info: status.info,
  };

  return (
    <div
      id={id}
      className={cn(
        'flex items-center justify-between rounded-md px-4 py-3 text-sm',
        statusMap[type],
        animation.fadeIn,
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-2">
        {iconMap[type]}
        <span>{message}</span>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            'ml-2 rounded-full p-1',
            effects.hover,
            effects.focus
          )}
          aria-label={`Dismiss ${type} message`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
