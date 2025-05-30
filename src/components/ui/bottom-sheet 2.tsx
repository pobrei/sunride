'use client';

/**
 * BottomSheet Component
 * 
 * This component provides a mobile-friendly bottom sheet with drag-to-dismiss functionality
 * following iOS 19 design principles.
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './button';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';

interface BottomSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Function called when the sheet is closed */
  onClose: () => void;
  /** Children components */
  children: React.ReactNode;
  /** Sheet title */
  title?: React.ReactNode;
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
  /** Sheet height (default: 'auto') */
  height?: 'auto' | 'full' | 'half' | 'third' | 'quarter' | string;
  /** Maximum height (in pixels or CSS value) */
  maxHeight?: string;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Function called when the sheet is fully opened */
  onOpenComplete?: () => void;
  /** Function called when the sheet is fully closed */
  onCloseComplete?: () => void;
}

/**
 * A mobile-friendly bottom sheet component with drag-to-dismiss functionality
 * following iOS 19 design principles
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  className,
  showCloseButton = true,
  showDragHandle = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  enableDrag = true,
  height = 'auto',
  maxHeight = '80vh',
  glass = true,
  bordered = true,
  shadowed = true,
  rounded = true,
  onOpenComplete,
  onCloseComplete,
}: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragControls = useAnimation();
  const dragStartY = useRef(0);
  const dragCurrentY = useRef(0);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (closeOnEscape && isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [closeOnEscape, isOpen, onClose]);

  // Handle click outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (closeOnClickOutside && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get height based on prop
  const getHeight = () => {
    switch (height) {
      case 'full':
        return '100vh';
      case 'half':
        return '50vh';
      case 'third':
        return '33vh';
      case 'quarter':
        return '25vh';
      case 'auto':
        return 'auto';
      default:
        return height;
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!enableDrag) return;
    
    setIsDragging(true);
    
    if ('touches' in e) {
      dragStartY.current = e.touches[0].clientY;
    } else {
      dragStartY.current = e.clientY;
    }
    
    dragCurrentY.current = 0;
  };

  // Handle drag move
  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!enableDrag || !isDragging) return;
    
    let currentY: number;
    
    if ('touches' in e) {
      currentY = e.touches[0].clientY;
    } else {
      currentY = e.clientY;
    }
    
    const deltaY = currentY - dragStartY.current;
    
    if (deltaY < 0) {
      // Don't allow dragging up
      dragCurrentY.current = 0;
      dragControls.set({ y: 0 });
    } else {
      dragCurrentY.current = deltaY;
      dragControls.set({ y: deltaY });
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!enableDrag || !isDragging) return;
    
    setIsDragging(false);
    
    if (dragCurrentY.current > 100) {
      // Dismiss the sheet if dragged down far enough
      onClose();
      dragControls.start({ y: '100%' });
    } else {
      // Snap back to position
      dragControls.start({ y: 0 });
    }
    
    dragCurrentY.current = 0;
  };

  return (
    <AnimatePresence onExitComplete={onCloseComplete}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClickOutside}
        >
          <motion.div
            ref={sheetRef}
            className={cn(
              'w-full sm:max-w-md overflow-hidden',
              rounded && 'rounded-t-xl',
              bordered && 'border border-border/20',
              shadowed && 'shadow-lg',
              glass && 'bg-card/95 backdrop-blur-md',
              className
            )}
            style={{
              height: getHeight(),
              maxHeight,
            }}
            initial={{ y: '100%' }}
            animate={dragControls}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onAnimationComplete={() => {
              if (isOpen) {
                onOpenComplete?.();
              }
            }}
            drag={enableDrag ? 'y' : false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle */}
            {showDragHandle && (
              <div className="flex justify-center p-2">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-border/20">
                {title && (
                  <h2 className="text-lg font-semibold">{title}</h2>
                )}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BottomSheet;
