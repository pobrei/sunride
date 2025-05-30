'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormErrorMessageProps {
  message: string;
  id?: string;
  className?: string;
}

/**
 * Form error message component
 */
export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ message, id, className }) => {
  return (
    <div
      id={id}
      className={cn('flex items-center gap-1.5 mt-1.5 text-sm text-destructive', className)}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};
