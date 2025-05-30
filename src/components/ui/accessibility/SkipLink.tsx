'use client';

/**
 * Skip Link Component
 * 
 * This component provides a skip link for keyboard users to bypass navigation.
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skip link props
 */
export interface SkipLinkProps {
  /** Link href */
  href: string;
  /** Children components */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

/**
 * Skip link component
 */
export function SkipLink({
  href,
  children,
  className,
  style,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:shadow-md',
        className
      )}
      style={style}
    >
      {children}
    </a>
  );
}

export default SkipLink;
