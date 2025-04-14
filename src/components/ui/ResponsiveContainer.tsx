'use client';

import React from 'react';
import { classNames } from '@/utils/classNames';
import { useMediaQuery } from '@/hooks';

interface ResponsiveContainerProps {
  /** Container content */
  children: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Maximum width of the container */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  /** Padding for the container */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether to center the container */
  centered?: boolean;
}

/**
 * A responsive container component
 */
export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
  centered = true,
}: ResponsiveContainerProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');

  // Map maxWidth to Tailwind classes
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
    none: '',
  };

  // Map padding to Tailwind classes
  const paddingClasses = {
    none: 'p-0',
    sm: isMobile ? 'px-2 py-2' : 'px-4 py-3',
    md: isMobile ? 'px-3 py-3' : 'px-6 py-4',
    lg: isMobile ? 'px-4 py-4' : 'px-8 py-6',
  };

  return (
    <div
      className={classNames(
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        centered && 'mx-auto',
        className
      )}
      data-testid="responsive-container"
    >
      {children}
    </div>
  );
}
