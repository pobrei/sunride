'use client';

import * as React from 'react';
import { classNames } from '@/utils/classNames';

interface TooltipProps {
  /** The content to display in the tooltip */
  content: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Optional delay before showing the tooltip (in ms) */
  delay?: number;
  /** Optional position of the tooltip */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Children (the element that triggers the tooltip) */
  children: React.ReactNode;
}

const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const Tooltip: React.FC<TooltipProps> = ({
  content,
  className,
  delay = 300,
  position = 'top',
  disabled = false,
  children
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  const handleMouseEnter = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: position === 'top' ? rect.top : rect.bottom
        });
        setIsVisible(true);
      }
    }, delay);
  };
  
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };
  
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <>
      <div 
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={classNames(
            'fixed z-50 px-3 py-1.5 text-sm rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-fade-in',
            position === 'top' && 'transform -translate-x-1/2 -translate-y-full mb-2',
            position === 'bottom' && 'transform -translate-x-1/2 mt-2',
            position === 'left' && 'transform -translate-y-1/2 -translate-x-full mr-2',
            position === 'right' && 'transform -translate-y-1/2 ml-2',
            className
          )}
          style={{
            left: `${coords.x}px`,
            top: position === 'bottom' ? `${coords.y}px` : position === 'top' ? `${coords.y}px` : `${coords.y}px`,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};

const TooltipTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const TooltipContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
