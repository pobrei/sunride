'use client';

import React, { useEffect } from 'react';

/**
 * A component that adds a class to the body when the user is navigating with a keyboard
 * This allows us to show focus outlines only when the user is navigating with a keyboard
 */
export function KeyboardFocusOutline() {
  useEffect(() => {
    // Function to handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    // Function to handle mouse navigation
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    // Add the initial class to the body
    if (typeof window !== 'undefined') {
      // Add a style element to the head
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        /* Hide focus outlines by default */
        :focus {
          outline: none;
        }
        
        /* Show focus outlines when using keyboard navigation */
        body.keyboard-navigation :focus {
          outline: 2px solid var(--color-ring);
          outline-offset: 2px;
        }
        
        /* Always show focus outlines for certain elements */
        a:focus, button:focus, input:focus, select:focus, textarea:focus {
          outline: 2px solid var(--color-ring);
          outline-offset: 2px;
        }
        
        /* Hide focus outlines for mouse users */
        body:not(.keyboard-navigation) a:focus, 
        body:not(.keyboard-navigation) button:focus, 
        body:not(.keyboard-navigation) input:focus, 
        body:not(.keyboard-navigation) select:focus, 
        body:not(.keyboard-navigation) textarea:focus {
          outline: none;
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Clean up event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return null;
}
