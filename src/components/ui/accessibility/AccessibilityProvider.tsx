'use client';

/**
 * Accessibility Provider Component
 * 
 * This component provides accessibility features for the application.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  useKeyboardNavigation, 
  useScreenReader, 
  useHighContrast, 
  useReducedMotion 
} from '@/lib/accessibility-utils';

/**
 * Accessibility context
 */
export interface AccessibilityContextType {
  /** Whether the user is using a keyboard */
  isKeyboardUser: boolean;
  /** Whether the user is using a screen reader */
  isScreenReaderUser: boolean;
  /** Whether the user has high contrast mode enabled */
  isHighContrast: boolean;
  /** Whether the user has reduced motion enabled */
  prefersReducedMotion: boolean;
  /** Whether to use large text */
  useLargeText: boolean;
  /** Whether to use high contrast */
  useHighContrast: boolean;
  /** Whether to use reduced motion */
  useReducedMotion: boolean;
  /** Whether to use screen reader announcements */
  useScreenReaderAnnouncements: boolean;
  /** Set whether to use large text */
  setUseLargeText: (value: boolean) => void;
  /** Set whether to use high contrast */
  setUseHighContrast: (value: boolean) => void;
  /** Set whether to use reduced motion */
  setUseReducedMotion: (value: boolean) => void;
  /** Set whether to use screen reader announcements */
  setUseScreenReaderAnnouncements: (value: boolean) => void;
  /** Announce a message to screen readers */
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
}

/**
 * Accessibility context
 */
export const AccessibilityContext = createContext<AccessibilityContextType>({
  isKeyboardUser: false,
  isScreenReaderUser: false,
  isHighContrast: false,
  prefersReducedMotion: false,
  useLargeText: false,
  useHighContrast: false,
  useReducedMotion: false,
  useScreenReaderAnnouncements: true,
  setUseLargeText: () => {},
  setUseHighContrast: () => {},
  setUseReducedMotion: () => {},
  setUseScreenReaderAnnouncements: () => {},
  announce: () => {},
});

/**
 * Accessibility provider props
 */
export interface AccessibilityProviderProps {
  /** Children components */
  children: React.ReactNode;
  /** Whether to use large text by default */
  defaultUseLargeText?: boolean;
  /** Whether to use high contrast by default */
  defaultUseHighContrast?: boolean;
  /** Whether to use reduced motion by default */
  defaultUseReducedMotion?: boolean;
  /** Whether to use screen reader announcements by default */
  defaultUseScreenReaderAnnouncements?: boolean;
}

/**
 * Accessibility provider component
 */
export function AccessibilityProvider({
  children,
  defaultUseLargeText = false,
  defaultUseHighContrast = false,
  defaultUseReducedMotion = false,
  defaultUseScreenReaderAnnouncements = true,
}: AccessibilityProviderProps) {
  // Get accessibility preferences
  const isKeyboardUser = useKeyboardNavigation();
  const isScreenReaderUser = useScreenReader();
  const isHighContrast = useHighContrast();
  const prefersReducedMotion = useReducedMotion();
  
  // State for user preferences
  const [useLargeText, setUseLargeText] = useState(defaultUseLargeText);
  const [useHighContrast, setUseHighContrast] = useState(defaultUseHighContrast || isHighContrast);
  const [useReducedMotion, setUseReducedMotion] = useState(defaultUseReducedMotion || prefersReducedMotion);
  const [useScreenReaderAnnouncements, setUseScreenReaderAnnouncements] = useState(defaultUseScreenReaderAnnouncements);
  
  // State for announcements
  const [announcement, setAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');
  
  // Announce a message to screen readers
  const announce = (message: string, level: 'polite' | 'assertive' = 'polite') => {
    if (!useScreenReaderAnnouncements) return;
    
    setPoliteness(level);
    setAnnouncement(message);
    
    // Clear announcement after a delay
    setTimeout(() => {
      setAnnouncement('');
    }, 1000);
  };
  
  // Apply accessibility preferences
  useEffect(() => {
    // Apply large text
    if (useLargeText) {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.remove('text-lg');
    }
    
    // Apply high contrast
    if (useHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (useReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [useLargeText, useHighContrast, useReducedMotion]);
  
  // Context value
  const contextValue: AccessibilityContextType = {
    isKeyboardUser,
    isScreenReaderUser,
    isHighContrast,
    prefersReducedMotion,
    useLargeText,
    useHighContrast,
    useReducedMotion,
    useScreenReaderAnnouncements,
    setUseLargeText,
    setUseHighContrast,
    setUseReducedMotion,
    setUseScreenReaderAnnouncements,
    announce,
  };
  
  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Screen reader announcements */}
      <div
        aria-live={politeness}
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>
      
      {/* Apply global styles for accessibility */}
      <style jsx global>{`
        /* Large text */
        html.text-lg {
          font-size: 125%;
        }
        
        /* High contrast */
        html.high-contrast {
          --background: #000000;
          --foreground: #ffffff;
          --card: #1a1a1a;
          --card-foreground: #ffffff;
          --popover: #1a1a1a;
          --popover-foreground: #ffffff;
          --primary: #ffff00;
          --primary-foreground: #000000;
          --secondary: #00ffff;
          --secondary-foreground: #000000;
          --muted: #333333;
          --muted-foreground: #ffffff;
          --accent: #ffff00;
          --accent-foreground: #000000;
          --destructive: #ff0000;
          --destructive-foreground: #ffffff;
          --border: #ffffff;
          --input: #333333;
          --ring: #ffff00;
          
          /* Increase contrast for focus states */
          --focus-ring: 0 0 0 4px #ffff00;
        }
        
        /* Reduced motion */
        html.reduce-motion * {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }
        
        /* Focus styles for keyboard users */
        html:not(.reduce-motion) *:focus-visible {
          outline: 3px solid var(--ring);
          outline-offset: 2px;
          box-shadow: var(--focus-ring);
          transition: outline-offset 0.2s ease;
        }
      `}</style>
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to use accessibility context
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  
  return context;
}

export default AccessibilityProvider;
