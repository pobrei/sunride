'use client';

import { useState, useEffect } from 'react';

/**
 * A hook that detects the current theme (dark or light)
 * @returns An object with isDarkMode boolean and a function to check if an element is in dark mode
 */
export function useThemeDetection() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Initial check
    const checkTheme = () => {
      // First check for .dark class on html element (next-themes approach)
      const htmlHasDarkClass = document.documentElement.classList.contains('dark');
      
      // Then check for data-theme attribute (another common approach)
      const dataTheme = document.documentElement.getAttribute('data-theme');
      
      // Finally check for prefers-color-scheme (system preference)
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Determine if dark mode is active
      const isDark = htmlHasDarkClass || dataTheme === 'dark' || prefersDark;
      setIsDarkMode(isDark);
    };

    // Check theme on mount
    checkTheme();

    // Set up listeners for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => checkTheme();
    mediaQuery.addEventListener('change', handleMediaChange);

    // Set up mutation observer to detect class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')
        ) {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      observer.disconnect();
    };
  }, []);

  // Helper function to check if an element is in dark mode
  const isElementInDarkMode = (element: HTMLElement | null): boolean => {
    if (!element) return isDarkMode;
    
    // Check if element or any parent has dark mode class or attribute
    let currentElement: HTMLElement | null = element;
    while (currentElement) {
      if (
        currentElement.classList.contains('dark') ||
        currentElement.getAttribute('data-theme') === 'dark'
      ) {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    
    // Fall back to global dark mode state
    return isDarkMode;
  };

  return { isDarkMode, isElementInDarkMode };
}
