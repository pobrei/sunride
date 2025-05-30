'use client';

/**
 * ResponsiveLayoutWrapper Component
 *
 * This component provides a responsive layout wrapper that combines
 * our layout components following iOS 19 design principles.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import MobileNavigation from './MobileNavigation';
import BottomNavigation from './BottomNavigation';
import ResponsiveContainer from './ResponsiveContainer';
import { useContainerMaxWidth, useSpacing, ContainerSize, SpacingSize } from '@/lib/responsive-utils';
import { usePerformance } from '@/components/performance/performance-provider';
import { SkipLink } from '@/components/ui/accessibility';

/**
 * Navigation item
 */
export interface NavItem {
  /** Navigation item href */
  href: string;
  /** Navigation item label */
  label: string;
  /** Navigation item icon */
  icon?: React.ReactNode;
  /** Whether the navigation item is active */
  active?: boolean;
  /** Whether the navigation item is disabled */
  disabled?: boolean;
  /** Whether the navigation item is external */
  external?: boolean;
  /** Navigation item onClick handler */
  onClick?: () => void;
}

export interface ResponsiveLayoutWrapperProps {
  /** Children components */
  children: React.ReactNode;
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Additional class names */
  className?: string;
  /** Whether to show top navigation */
  showTopNav?: boolean;
  /** Whether to show bottom navigation */
  showBottomNav?: boolean;
  /** Whether to use a container */
  useContainer?: boolean;
  /** Container max width */
  maxWidth?: ContainerSize | { xs?: ContainerSize; sm?: ContainerSize; md?: ContainerSize; lg?: ContainerSize; xl?: ContainerSize; '2xl'?: ContainerSize; };
  /** Container padding */
  padding?: SpacingSize | { xs?: SpacingSize; sm?: SpacingSize; md?: SpacingSize; lg?: SpacingSize; xl?: SpacingSize; '2xl'?: SpacingSize; };
  /** Whether to use glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Whether to use full height */
  fullHeight?: boolean;
  /** Whether to show a header */
  showHeader?: boolean;
  /** Whether to show a footer */
  showFooter?: boolean;
  /** Custom navigation items */
  navItems?: NavItem[];
  /** Whether to adjust for bottom navigation */
  adjustForBottomNav?: boolean;
  /** Whether to show a skip link */
  showSkipLink?: boolean;
  /** Skip link target */
  skipLinkTarget?: string;
  /** Custom header */
  header?: React.ReactNode;
  /** Custom footer */
  footer?: React.ReactNode;
  /** Additional styles */
  style?: React.CSSProperties;
  /** HTML tag to use */
  as?: React.ElementType;
  /** ID for the layout */
  id?: string;
  /** ARIA label */
  ariaLabel?: string;
  /** ARIA labelledby */
  ariaLabelledby?: string;
  /** ARIA describedby */
  ariaDescribedby?: string;
  /** ARIA role */
  role?: string;
  /** Data attributes */
  data?: Record<string, string>;
}

/**
 * A responsive layout wrapper component that follows iOS 19 design principles
 */
export function ResponsiveLayoutWrapper({
  children,
  title,
  description,
  className,
  showTopNav = true,
  showBottomNav = true,
  useContainer = true,
  maxWidth = 'xl',
  padding = 'md',
  glass = false,
  bordered = false,
  shadowed = false,
  rounded = false,
  fullHeight = true,
  showHeader = true,
  showFooter = false,
  navItems,
  adjustForBottomNav = true,
  showSkipLink = true,
  skipLinkTarget = '#main-content',
  header,
  footer,
  style,
  as: Component = 'div',
  id,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  role,
  data,
}: ResponsiveLayoutWrapperProps) {
  const performance = usePerformance();

  // Get container max width
  const containerMaxWidth = useContainerMaxWidth(maxWidth);

  // Get container padding
  const containerPadding = useSpacing(padding);

  // Generate data attributes
  const dataAttributes: Record<string, string> = {};
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      dataAttributes[`data-${key}`] = value;
    });
  }

  return (
    <Component
      id={id}
      className={cn('min-h-screen flex flex-col', className)}
      style={style}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      role={role}
      {...dataAttributes}
    >
      {/* Skip Link for Accessibility */}
      {showSkipLink && (
        <SkipLink href={skipLinkTarget}>Skip to content</SkipLink>
      )}

      {/* Top navigation */}
      {showTopNav && (
        header || (
          <MobileNavigation
            title={title}
            navItems={navItems}
            bordered={true}
            shadowed={true}
            glass={true}
            sticky={true}
          />
        )
      )}

      {/* Main content */}
      <main
        id="main-content"
        className={cn(
          'flex-1',
          fullHeight && 'flex flex-col',
          adjustForBottomNav && showBottomNav && 'pb-16 md:pb-0'
        )}
      >
        {/* Header */}
        {showHeader && title && !header && (
          <header className="py-4 px-4 sm:px-6 md:px-8">
            <div className={cn(useContainer && 'container mx-auto')}>
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </header>
        )}

        {/* Content */}
        {useContainer ? (
          <ResponsiveContainer
            maxWidth={maxWidth}
            padding={padding}
            glass={glass}
            bordered={bordered}
            shadowed={shadowed}
            rounded={rounded}
            fullHeight={fullHeight}
            className="flex-1"
          >
            {children}
          </ResponsiveContainer>
        ) : (
          <div className={cn('flex-1', fullHeight && 'flex flex-col')}>
            {children}
          </div>
        )}

        {/* Footer */}
        {showFooter && !footer && (
          <footer className="py-4 px-4 sm:px-6 md:px-8 border-t border-border/20 mt-auto">
            <div className={cn(useContainer && 'container mx-auto')}>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Weather Route
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </footer>
        )}

        {/* Custom Footer */}
        {footer}
      </main>

      {/* Bottom navigation */}
      {showBottomNav && <BottomNavigation navItems={navItems} />}
    </Component>
  );
}

export default ResponsiveLayoutWrapper;
