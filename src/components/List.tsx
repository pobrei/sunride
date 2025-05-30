'use client';

import React from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
import { typography, animation } from '@/styles/tailwind-utils';

interface ListItem {
  id: string | number;
  title?: string;
  description?: string;
  [key: string]: unknown;
}

interface ListProps {
  /** Array of items to display in the list */
  items: ListItem[];
  /** Currently selected item */
  selectedItem?: ListItem | null;
  /** Function called when an item is clicked */
  onItemClick: (item: ListItem) => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * List component displays a scrollable list of locations
 * with improved accessibility, security and visual feedback
 */
export default function List({ items, selectedItem, onItemClick, className }: ListProps) {
  // Convert item ID to safe string for DOM id attribute
  const getSafeItemId = (itemId: string | number) => {
    return `list-item-${String(itemId).replace(/[^a-z0-9]/gi, '-')}`;
  };

  // Focus the selected item when it changes
  React.useEffect(() => {
    if (selectedItem) {
      const element = document.getElementById(getSafeItemId(selectedItem.id));
      if (element) {
        element.focus();
      }
    }
  }, [selectedItem]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, item: ListItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onItemClick(item);
    }
  };

  return (
    <div
      className={cn('space-y-2 overflow-auto max-h-full', className)}
      role="group"
      aria-label="Location list"
    >
      {items.map(item => {
        // Sanitize item data to prevent XSS
        const safeTitle = DOMPurify.sanitize(item.title || '');
        const safeDescription = DOMPurify.sanitize(item.description || '');

        // Determine if this item is selected
        const isSelected = selectedItem && selectedItem.id === item.id;

        return (
          <div
            key={item.id}
            id={getSafeItemId(item.id)}
            className={cn(
              'p-3 rounded-md border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50',
              isSelected
                ? 'bg-primary/10 border-primary shadow-sm border-l-4'
                : 'bg-card border-border hover:bg-muted/50',
              animation.transition
            )}
            role="button"
            tabIndex={0}
            onClick={() => onItemClick(item)}
            onKeyDown={e => handleKeyDown(e, item)}
            aria-label={`Location ${safeTitle}`}
            aria-pressed={isSelected}
          >
            <h3 className={cn(typography.h6, 'mb-2')}>{safeTitle}</h3>
            <p className={cn(typography.bodySm, 'text-muted-foreground')}>{safeDescription}</p>
            {isSelected && (
              <div
                className={cn(
                  'mt-2 text-xs font-medium text-primary flex items-center gap-1',
                  animation.fadeIn
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Selected
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
