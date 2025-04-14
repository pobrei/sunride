'use client';

import React from 'react';
import { classNames } from '@/utils/classNames';

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
      // Set focus to the element
      element.focus();

      // Scroll to the element
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${contentId}`}
      className={classNames(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:rounded-md',
        className
      )}
      onClick={handleClick}
      data-testid="skip-to-content"
    >
      {text}
    </a>
  );
}
