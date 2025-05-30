'use client';

/**
 * MobileAccordion Component
 * 
 * This component provides a mobile-friendly accordion with touch-friendly interactions
 * following iOS 19 design principles.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface MobileAccordionItemProps {
  /** Item title */
  title: React.ReactNode;
  /** Item content */
  children: React.ReactNode;
  /** Whether the item is open */
  isOpen: boolean;
  /** Function called when the item is toggled */
  onToggle: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Additional class names for the item */
  className?: string;
  /** Additional class names for the title */
  titleClassName?: string;
  /** Additional class names for the content */
  contentClassName?: string;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
}

/**
 * MobileAccordionItem Component
 */
const MobileAccordionItem: React.FC<MobileAccordionItemProps> = ({
  title,
  children,
  isOpen,
  onToggle,
  disabled = false,
  className,
  titleClassName,
  contentClassName,
  icon,
  bordered = true,
  glass = false,
}) => {
  return (
    <div
      className={cn(
        'overflow-hidden',
        bordered && 'border border-border/20 rounded-lg mb-2',
        glass && 'bg-card/80 backdrop-blur-sm',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      <button
        className={cn(
          'flex items-center justify-between w-full p-4 text-left',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'active:bg-muted/50 transition-colors duration-200',
          isOpen && 'bg-muted/30',
          titleClassName
        )}
        onClick={onToggle}
        disabled={disabled}
        aria-expanded={isOpen}
      >
        <span className="font-medium">{title}</span>
        {icon || (
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )}
          />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={cn('overflow-hidden', contentClassName)}
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface MobileAccordionProps {
  /** Accordion items */
  items: Array<{
    id: string;
    title: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
  }>;
  /** Default open item IDs */
  defaultOpen?: string[];
  /** Whether to allow multiple items to be open */
  allowMultiple?: boolean;
  /** Whether to collapse others when an item is opened */
  collapseOthers?: boolean;
  /** Additional class names */
  className?: string;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Function called when an item is toggled */
  onItemToggle?: (itemId: string, isOpen: boolean) => void;
}

/**
 * A mobile-friendly accordion component with touch-friendly interactions
 * following iOS 19 design principles
 */
export function MobileAccordion({
  items,
  defaultOpen = [],
  allowMultiple = false,
  collapseOthers = true,
  className,
  bordered = true,
  glass = false,
  onItemToggle,
}: MobileAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  // Handle item toggle
  const handleToggle = (itemId: string) => {
    setOpenItems(prev => {
      const isOpen = prev.includes(itemId);
      let newOpenItems: string[];
      
      if (isOpen) {
        // Close the item
        newOpenItems = prev.filter(id => id !== itemId);
      } else {
        // Open the item
        if (allowMultiple) {
          // Allow multiple open items
          newOpenItems = [...prev, itemId];
        } else if (collapseOthers) {
          // Collapse others when opening an item
          newOpenItems = [itemId];
        } else {
          // Toggle the current item
          newOpenItems = prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId];
        }
      }
      
      // Call onItemToggle callback
      onItemToggle?.(itemId, !isOpen);
      
      return newOpenItems;
    });
  };

  return (
    <div className={cn('space-y-2', className)}>
      {items.map(item => (
        <MobileAccordionItem
          key={item.id}
          title={item.title}
          isOpen={openItems.includes(item.id)}
          onToggle={() => handleToggle(item.id)}
          disabled={item.disabled}
          icon={item.icon}
          bordered={bordered}
          glass={glass}
        >
          {item.content}
        </MobileAccordionItem>
      ))}
    </div>
  );
}

export default MobileAccordion;
