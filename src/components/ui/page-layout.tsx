'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  /** Page content */
  children: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Page header content */
  header?: React.ReactNode;
  /** Page footer content */
  footer?: React.ReactNode;
  /** Page sidebar content */
  sidebar?: React.ReactNode;
  /** Sidebar width */
  sidebarWidth?: 'sm' | 'md' | 'lg' | 'xl';
  /** Sidebar position */
  sidebarPosition?: 'left' | 'right';
  /** Whether the sidebar is collapsible on mobile */
  sidebarCollapsible?: boolean;
  /** Whether the sidebar is initially collapsed on mobile */
  sidebarInitiallyCollapsed?: boolean;
  /** Maximum width of the content */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  /** Padding for the content */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether to center the content */
  centered?: boolean;
  /** Whether to add a gap between sections */
  gapBetweenSections?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * A responsive page layout component that follows iOS 19 design principles
 */
export function PageLayout({
  children,
  className,
  header,
  footer,
  sidebar,
  sidebarWidth = 'md',
  sidebarPosition = 'left',
  sidebarCollapsible = true,
  sidebarInitiallyCollapsed = true,
  maxWidth = 'xl',
  padding = 'md',
  centered = true,
  gapBetweenSections = 'md',
}: PageLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(sidebarInitiallyCollapsed);
  
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

  // Map padding to Tailwind classes with responsive values
  const paddingClasses = {
    none: 'p-0',
    sm: 'px-3 py-2 sm:px-4 sm:py-3',
    md: 'px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6',
    lg: 'px-5 py-4 sm:px-8 sm:py-6 lg:px-12 lg:py-8',
  };
  
  // Map sidebar width to Tailwind classes
  const sidebarWidthClasses = {
    sm: 'w-64',
    md: 'w-72',
    lg: 'w-80',
    xl: 'w-96',
  };
  
  // Map gap between sections to Tailwind classes
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {header}
        </header>
      )}
      
      {/* Main content with optional sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar - Left position */}
        {sidebar && sidebarPosition === 'left' && (
          <>
            {/* Desktop sidebar */}
            <aside className={cn(
              'hidden md:block border-r border-border/40 bg-card/50',
              sidebarWidthClasses[sidebarWidth]
            )}>
              {sidebar}
            </aside>
            
            {/* Mobile sidebar */}
            {sidebarCollapsible && (
              <div className={cn(
                'md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-200',
                sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              )}>
                <div className={cn(
                  'absolute inset-y-0 left-0 bg-card border-r border-border/40 transition-transform duration-200 ease-in-out',
                  sidebarWidthClasses[sidebarWidth],
                  sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
                )}>
                  {sidebar}
                </div>
                
                {/* Close button */}
                <button
                  className="absolute top-4 right-4 p-2 rounded-full bg-card shadow-md"
                  onClick={toggleSidebar}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>
            )}
            
            {/* Toggle button for mobile */}
            {sidebarCollapsible && sidebarCollapsed && (
              <button
                className="md:hidden fixed bottom-4 left-4 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-lg"
                onClick={toggleSidebar}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" x2="21" y1="6" y2="6"></line>
                  <line x1="3" x2="21" y1="12" y2="12"></line>
                  <line x1="3" x2="21" y1="18" y2="18"></line>
                </svg>
              </button>
            )}
          </>
        )}
        
        {/* Main content */}
        <main className={cn(
          'flex-1',
          className
        )}>
          <div className={cn(
            'flex flex-col',
            gapClasses[gapBetweenSections],
            centered && 'mx-auto',
            maxWidthClasses[maxWidth],
            paddingClasses[padding]
          )}>
            {children}
          </div>
        </main>
        
        {/* Sidebar - Right position */}
        {sidebar && sidebarPosition === 'right' && (
          <>
            {/* Desktop sidebar */}
            <aside className={cn(
              'hidden md:block border-l border-border/40 bg-card/50',
              sidebarWidthClasses[sidebarWidth]
            )}>
              {sidebar}
            </aside>
            
            {/* Mobile sidebar */}
            {sidebarCollapsible && (
              <div className={cn(
                'md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-200',
                sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              )}>
                <div className={cn(
                  'absolute inset-y-0 right-0 bg-card border-l border-border/40 transition-transform duration-200 ease-in-out',
                  sidebarWidthClasses[sidebarWidth],
                  sidebarCollapsed ? 'translate-x-full' : 'translate-x-0'
                )}>
                  {sidebar}
                </div>
                
                {/* Close button */}
                <button
                  className="absolute top-4 left-4 p-2 rounded-full bg-card shadow-md"
                  onClick={toggleSidebar}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>
            )}
            
            {/* Toggle button for mobile */}
            {sidebarCollapsible && sidebarCollapsed && (
              <button
                className="md:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-lg"
                onClick={toggleSidebar}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" x2="21" y1="6" y2="6"></line>
                  <line x1="3" x2="21" y1="12" y2="12"></line>
                  <line x1="3" x2="21" y1="18" y2="18"></line>
                </svg>
              </button>
            )}
          </>
        )}
      </div>
      
      {/* Footer */}
      {footer && (
        <footer className="border-t border-border/40 bg-card/50">
          {footer}
        </footer>
      )}
    </div>
  );
}

export default PageLayout;
