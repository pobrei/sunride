'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { typography, animation, layout, responsive } from '@/styles/tailwind-utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Sidebar } from '@/components/layout/sidebar';

interface ResponsiveLayoutProps {
  /** The main content to display */
  children: React.ReactNode;
  /** The sidebar content to display */
  sidebarContent: React.ReactNode;
  /** Optional header content to display above the main content */
  headerContent?: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Whether to show the header */
  showHeader?: boolean;
  /** Whether to show the footer */
  showFooter?: boolean;
  /** Whether the sidebar is collapsible */
  sidebarCollapsible?: boolean;
  /** Whether the sidebar is collapsed by default */
  sidebarDefaultCollapsed?: boolean;
  /** Optional title for the sidebar */
  sidebarTitle?: string;
  /** Optional icon for the sidebar */
  sidebarIcon?: React.ReactNode;
  /** Optional title for the header */
  headerTitle?: string;
  /** Whether to show a back button in the header */
  showBackButton?: boolean;
  /** Optional back URL for the header */
  backUrl?: string;
}

/**
 * A responsive layout component with a sidebar and main content area
 */
export function ResponsiveLayout({
  children,
  sidebarContent,
  headerContent,
  className,
  showHeader = true,
  showFooter = true,
  sidebarCollapsible = true,
  sidebarDefaultCollapsed = false,
  sidebarTitle = 'Controls',
  sidebarIcon,
  headerTitle,
  showBackButton = false,
  backUrl,
}: ResponsiveLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className={cn(layout.flexCol, 'min-h-screen bg-zinc-50 dark:bg-zinc-900 container-transition')}>
      {/* Header */}
      {showHeader && <Header title={headerTitle} showBackButton={showBackButton} backUrl={backUrl} />}

      {/* Main content */}
      <div className={cn(layout.flexRow, 'flex-1 overflow-hidden bg-zinc-50 dark:bg-zinc-900')}>
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar
            title={sidebarTitle}
            icon={sidebarIcon}
            collapsible={sidebarCollapsible}
            defaultCollapsed={sidebarDefaultCollapsed}
          >
            {sidebarContent}
          </Sidebar>
        </div>

        {/* Mobile sidebar toggle */}
        <div className="md:hidden fixed bottom-4 left-4 z-40">
          <Button
            variant="default"
            size="icon"
            onClick={toggleMobileSidebar}
            className={cn('h-12 w-12 rounded-full shadow-lg', animation.buttonPress)}
            aria-label={mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-30 w-[280px] transform bg-white dark:bg-zinc-800 shadow-xl transition-transform duration-300 ease-in-out md:hidden',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-zinc-100 dark:border-zinc-700 px-4">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">{sidebarTitle}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileSidebar}
              className="h-8 w-8"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-3 sm:p-4 overflow-auto h-[calc(100vh-4rem)]">{sidebarContent}</div>
        </div>

        {/* Main content area */}
        <main className={cn('flex-1 overflow-auto', className)}>
          {/* Optional header content */}
          {headerContent && (
            <div className="border-b border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-4 max-w-7xl mx-auto shadow-sm">{headerContent}</div>
          )}

          {/* Main content */}
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:py-8">{children}</div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}
