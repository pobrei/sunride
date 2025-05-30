'use client';

/**
 * ActionSheet Component
 * 
 * This component provides a mobile-friendly action sheet
 * following iOS 19 design principles.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './button';
import BottomSheet from './bottom-sheet';

interface ActionSheetItem {
  /** Item ID */
  id: string;
  /** Item label */
  label: string;
  /** Item icon */
  icon?: React.ReactNode;
  /** Function called when the item is clicked */
  onClick?: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether the item is destructive */
  destructive?: boolean;
  /** Item description */
  description?: string;
}

interface ActionSheetProps {
  /** Whether the action sheet is open */
  isOpen: boolean;
  /** Function called when the action sheet is closed */
  onClose: () => void;
  /** Action sheet title */
  title?: string;
  /** Action sheet description */
  description?: string;
  /** Action items */
  items: ActionSheetItem[];
  /** Cancel button label */
  cancelLabel?: string;
  /** Whether to show a cancel button */
  showCancel?: boolean;
  /** Additional class names */
  className?: string;
  /** Whether to show a close button */
  showCloseButton?: boolean;
  /** Whether to show a drag handle */
  showDragHandle?: boolean;
  /** Whether to close when clicking outside */
  closeOnClickOutside?: boolean;
  /** Whether to close when pressing escape */
  closeOnEscape?: boolean;
  /** Whether to enable drag-to-dismiss */
  enableDrag?: boolean;
  /** Whether to group items by type */
  groupItems?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
}

/**
 * A mobile-friendly action sheet component
 * following iOS 19 design principles
 */
export function ActionSheet({
  isOpen,
  onClose,
  title,
  description,
  items,
  cancelLabel = 'Cancel',
  showCancel = true,
  className,
  showCloseButton = false,
  showDragHandle = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  enableDrag = true,
  groupItems = true,
  glass = true,
  bordered = true,
  shadowed = true,
  rounded = true,
}: ActionSheetProps) {
  // Group items by type (normal, destructive)
  const groupedItems = groupItems
    ? {
        normal: items.filter(item => !item.destructive),
        destructive: items.filter(item => item.destructive),
      }
    : { normal: items, destructive: [] };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={showCloseButton}
      showDragHandle={showDragHandle}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      enableDrag={enableDrag}
      glass={glass}
      bordered={bordered}
      shadowed={shadowed}
      rounded={rounded}
      className={className}
    >
      <div className="p-4 space-y-4">
        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground text-center px-4">
            {description}
          </p>
        )}

        {/* Normal actions */}
        {groupedItems.normal.length > 0 && (
          <div className="space-y-2">
            {groupedItems.normal.map(item => (
              <button
                key={item.id}
                className={cn(
                  'w-full flex items-center px-4 py-3 rounded-lg text-left',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  'transition-colors duration-200',
                  item.disabled
                    ? 'opacity-50 cursor-not-allowed bg-muted'
                    : 'bg-card hover:bg-muted/50 active:bg-muted'
                )}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                    onClose();
                  }
                }}
                disabled={item.disabled}
              >
                {item.icon && (
                  <span className="mr-3 text-muted-foreground">{item.icon}</span>
                )}
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Destructive actions */}
        {groupItems && groupedItems.destructive.length > 0 && (
          <div className="space-y-2 pt-2">
            {groupedItems.destructive.map(item => (
              <button
                key={item.id}
                className={cn(
                  'w-full flex items-center px-4 py-3 rounded-lg text-left',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive',
                  'transition-colors duration-200 text-destructive',
                  item.disabled
                    ? 'opacity-50 cursor-not-allowed bg-muted'
                    : 'bg-destructive/10 hover:bg-destructive/20 active:bg-destructive/30'
                )}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                    onClose();
                  }
                }}
                disabled={item.disabled}
              >
                {item.icon && <span className="mr-3">{item.icon}</span>}
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-destructive/70 mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Cancel button */}
        {showCancel && (
          <div className="pt-2">
            <button
              className={cn(
                'w-full flex justify-center items-center px-4 py-3 rounded-lg font-medium',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                'transition-colors duration-200',
                'bg-muted hover:bg-muted/80 active:bg-muted/60'
              )}
              onClick={onClose}
            >
              {cancelLabel}
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

export default ActionSheet;
