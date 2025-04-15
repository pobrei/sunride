/**
 * Utility functions for accessibility
 */

/**
 * Announces a message to screen readers using an ARIA live region
 * @param message - The message to announce
 * @param priority - The priority of the announcement (polite or assertive)
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  // Try to find an existing announcer element
  let announcer = document.getElementById('screen-reader-announcer');
  
  // Create one if it doesn't exist
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
  } else {
    // Update the priority if needed
    announcer.setAttribute('aria-live', priority);
  }
  
  // Set the message
  announcer.textContent = message;
  
  // Clear the message after a delay (optional)
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = '';
    }
  }, 3000);
}

/**
 * Makes an element focusable by setting tabindex if needed
 * @param element - The element to make focusable
 * @param focus - Whether to focus the element after making it focusable
 */
export function makeElementFocusable(element: HTMLElement, focus = false): void {
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
  }
  
  if (focus) {
    element.focus();
  }
}

/**
 * Traps focus within an element (for modals, dialogs, etc.)
 * @param element - The element to trap focus within
 * @returns A function to remove the focus trap
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) {
    return () => {};
  }
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  // Focus the first element
  firstElement.focus();
  
  // Handle tab key to cycle through focusable elements
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // If shift+tab and on first element, go to last element
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // If tab and on last element, go to first element
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
    
    // Handle escape key to close modal/dialog
    if (e.key === 'Escape') {
      const closeButton = element.querySelector('[data-close-dialog]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  
  // Return a function to remove the event listener
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Checks if an element is visible to screen readers
 * @param element - The element to check
 * @returns Whether the element is visible to screen readers
 */
export function isVisibleToScreenReaders(element: HTMLElement): boolean {
  // Check if the element is hidden from screen readers
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  
  // Check if the element is in the DOM
  if (!document.body.contains(element)) {
    return false;
  }
  
  // Check if the element or any of its ancestors have display: none
  let currentElement: HTMLElement | null = element;
  while (currentElement) {
    const style = window.getComputedStyle(currentElement);
    if (style.display === 'none') {
      return false;
    }
    currentElement = currentElement.parentElement;
  }
  
  return true;
}
