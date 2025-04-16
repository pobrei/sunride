'use client';

import { Clock } from 'lucide-react';

interface LoadingSpinnerProps {
  message: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Loading spinner component for async operations
 */
export function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
  // Size mappings
  const sizeClasses = {
    sm: {
      container: 'space-y-2',
      icon: 'p-2',
      iconSize: 'h-4 w-4',
      text: 'text-xs'
    },
    md: {
      container: 'space-y-3',
      icon: 'p-3',
      iconSize: 'h-6 w-6',
      text: 'text-sm'
    },
    lg: {
      container: 'space-y-4',
      icon: 'p-4',
      iconSize: 'h-8 w-8',
      text: 'text-base'
    }
  };

  const { container, icon, iconSize, text } = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center ${container} text-muted-foreground`}>
      <div className={`bg-primary/10 ${icon} rounded-full`}>
        <Clock className={`animate-spin ${iconSize} text-primary`} />
      </div>
      <span className={`${text} font-medium`}>{message}</span>
    </div>
  );
}
