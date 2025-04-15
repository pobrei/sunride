'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typography, animation } from '@/styles/tailwind-utils';

interface FormErrorMessageProps {
  /** The error message to display */
  message: string;
  /** ID for the error message (for ARIA purposes) */
  id?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * A reusable error message component for form validation errors
 * with proper accessibility attributes
 */
export function FormErrorMessage({
  message,
  id,
  className,
}: FormErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      id={id}
      className={cn(
        'flex items-center gap-2 text-destructive text-sm mt-1',
        animation.fadeIn,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
