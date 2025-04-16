'use client';

import React from 'react';
import { Header } from '@frontend/components/layout/header';
import { Footer } from '@frontend/components/layout/footer';
import { cn } from '@shared/lib/utils';
import { layout } from '@shared/styles/tailwind-utils';
import { PageTransition } from '@frontend/components/ui/page-transition';

interface PageWrapperProps {
  /** Children to render inside the page wrapper */
  children: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Whether to show the header */
  showHeader?: boolean;
  /** Whether to show the footer */
  showFooter?: boolean;
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
  showFooter = true,
  withPadding = true,
}: PageWrapperProps) {
  return (
    <div className={cn(layout.flexCol, 'min-h-screen container-transition')}>
      {showHeader && <Header />}
      <PageTransition>
        <main className={cn('flex-1', withPadding && 'container py-6', className)}>{children}</main>
      </PageTransition>
      {showFooter && <Footer />}
    </div>
  );
}
