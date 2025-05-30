'use client';

/**
 * Accessibility Components
 * 
 * This file provides components and utilities to improve accessibility
 * following WCAG 2.1 AA standards.
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * SkipLink Component
 * 
 * Provides a skip link that allows keyboard users to bypass navigation
 * and go directly to the main content.
 */
export function SkipLink({
  href = '#main-content',
  children = 'Skip to main content',
  className,
}: {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50',
        'bg-primary text-primary-foreground px-4 py-2 rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * VisuallyHidden Component
 * 
 * Hides content visually but keeps it accessible to screen readers.
 */
export function VisuallyHidden({
  children,
  asChild = false,
  className,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  const Comp = asChild ? React.Fragment : 'span';
  return (
    <Comp
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

/**
 * FocusTrap Component
 * 
 * Traps focus within a component, useful for modals and dialogs.
 */
export function FocusTrap({
  children,
  active = true,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Find all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus the first element when the trap is activated
    firstElement?.focus();
    
    // Handle tab key to keep focus within the container
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // If shift+tab and on first element, go to last element
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // If tab and on last element, go to first element
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);
  
  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * LiveRegion Component
 * 
 * Creates a live region for screen readers to announce dynamic content changes.
 */
export function LiveRegion({
  children,
  ariaLive = 'polite',
  ariaAtomic = true,
  className,
}: {
  children: React.ReactNode;
  ariaLive?: 'off' | 'polite' | 'assertive';
  ariaAtomic?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  );
}

/**
 * AccessibleIcon Component
 * 
 * Wraps an icon with a visually hidden label for screen readers.
 */
export function AccessibleIcon({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center justify-center', className)} aria-hidden="true">
      {children}
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}

/**
 * useAnnounce Hook
 * 
 * A hook that announces messages to screen readers.
 */
export function useAnnounce() {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');
  
  const announce = (text: string, level: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(level);
    setMessage(text);
    
    // Clear the message after a short delay to allow for re-announcing the same message
    setTimeout(() => {
      setMessage('');
    }, 1000);
  };
  
  return {
    announce,
    Announcer: () => (
      <LiveRegion ariaLive={politeness}>
        {message}
      </LiveRegion>
    ),
  };
}

/**
 * AccessibilityProvider Component
 * 
 * Provides accessibility features to the application.
 */
export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { Announcer } = useAnnounce();
  
  return (
    <>
      <SkipLink />
      <Announcer />
      {children}
    </>
  );
}

export default AccessibilityProvider;
