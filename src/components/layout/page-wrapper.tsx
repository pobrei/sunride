'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { layout, responsive } from '@/styles/tailwind-utils';
import { PageTransition } from '@/components/ui/page-transition';

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
  /** Optional title for the header */
  headerTitle?: string;
  /** Whether to show a back button in the header */
  showBackButton?: boolean;
  /** Optional back URL for the header */
  backUrl?: string;
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
  headerTitle,
  showBackButton = false,
  backUrl,
}: PageWrapperProps) {
  return (
    <div className={cn(layout.flexCol, 'min-h-screen container-transition')}>
      {showHeader && <Header title={headerTitle} showBackButton={showBackButton} backUrl={backUrl} />}
      <PageTransition>
        <main className={cn('flex-1', withPadding && 'max-w-7xl mx-auto px-4 py-4 sm:py-6 md:py-8', className)}>{children}</main>
      </PageTransition>
      {showFooter && <Footer />}
    </div>
  );
}
