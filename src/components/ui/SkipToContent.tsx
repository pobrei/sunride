'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { effects } from '@/styles/tailwind-utils';

interface SkipToContentProps {
  /** The ID of the main content element */
  contentId?: string;
  /** The text to display */
  text?: string;
  /** Optional className for styling */
  className?: string;
}

/**
 * A component that allows keyboard users to skip to the main content
 */
export function SkipToContent({
  contentId = 'main-content',
  text = 'Skip to content',
  className,
}: SkipToContentProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const element = document.getElementById(contentId);
    if (element) {
      // Set tabindex if not already focusable
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1');
      }

      // Set focus to the element
      element.focus();

      // Scroll to the element
      element.scrollIntoView({ behavior: 'smooth' });

      // Announce to screen readers
      const announcer = document.getElementById('skip-to-content-announcer');
      if (announcer) {
        announcer.textContent = `Skipped to ${element.getAttribute('aria-label') || 'main content'}`;
      }
    }
  };

  return (
    <>
      {/* Hidden announcer for screen readers */}
      <div
        id="skip-to-content-announcer"
        className="sr-only"
        role="status"
        aria-live="polite"
      ></div>

      <a
        href={`#${contentId}`}
        className={cn(
          'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4',
          'focus:bg-background focus:text-foreground focus:rounded-md',
          effects.focus,
          className
        )}
        onClick={handleClick}
        data-testid="skip-to-content"
        aria-label={`Skip to ${contentId.replace(/-/g, ' ')}`}
      >
        {text}
      </a>
    </>
  );
}
