'use client';

import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface LazyLoadProps {
  /** Component to lazy load */
  component: React.ComponentType<unknown>;
  /** Props to pass to the component */
  componentProps?: Record<string, unknown>;
  /** Loading component */
  fallback?: React.ReactNode;
  /** Error component */
  errorComponent?: React.ReactNode;
  /** Whether to show the component only when it's in the viewport */
  onlyWhenVisible?: boolean;
  /** Root margin for the intersection observer */
  rootMargin?: string;
}

/**
 * A component that lazy loads another component
 */
export function LazyLoad({
  component: Component,
  componentProps = {},
  fallback = <LoadingSpinner centered variant="train" />,
  errorComponent = <ErrorMessage message="Failed to load component" />,
  onlyWhenVisible = false,
  rootMargin = '100px',
}: LazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(!onlyWhenVisible);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(!onlyWhenVisible);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onlyWhenVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [onlyWhenVisible, rootMargin]);

  useEffect(() => {
    if (isVisible && !isLoaded) {
      try {
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading component:', error);
        setHasError(true);
      }
    }
  }, [isVisible, isLoaded]);

  if (hasError) {
    return <>{errorComponent}</>;
  }

  if (!isVisible || !isLoaded) {
    return <div ref={containerRef}>{fallback}</div>;
  }

  return (
    <div ref={containerRef}>
      <Component {...componentProps} />
    </div>
  );
}
