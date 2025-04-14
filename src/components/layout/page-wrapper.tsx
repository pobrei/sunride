'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  /** Children to render inside the page wrapper */
  children: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Whether to show the header */
  showHeader?: boolean;
  /** Whether to show padding */
  withPadding?: boolean;
}

/**
 * A wrapper component for pages that includes the header
 */
export function PageWrapper({
  children,
  className,
  showHeader = true,
  withPadding = true,
}: PageWrapperProps) {
  return (
    <>
      {showHeader && <Header />}
      <main
        className={cn(
          'flex-1',
          withPadding && 'container py-6',
          className
        )}
      >
        {children}
      </main>
    </>
  );
}
