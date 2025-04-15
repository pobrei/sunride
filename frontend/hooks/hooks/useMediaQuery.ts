import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design
 *
 * @param query - The media query to match
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Prevent SSR issues
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);

    // Update the state with the current value
    setMatches(media.matches);

    // Create a listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the listener to watch for changes
    media.addEventListener('change', listener);

    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined media query hooks
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 640px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}
