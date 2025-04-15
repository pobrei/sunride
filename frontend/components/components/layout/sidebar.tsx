'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Upload, Settings, BarChart, Info } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';
import { cn } from '@shared/lib/utils';
import { typography, animation, effects, layout } from '@shared/styles/tailwind-utils';

interface SidebarProps {
  /** The content to display in the sidebar */
  children: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Whether the sidebar is collapsed */
  defaultCollapsed?: boolean;
  /** Whether the sidebar is collapsible */
  collapsible?: boolean;
  /** Optional title for the sidebar */
  title?: string;
  /** Optional icon for the sidebar */
  icon?: React.ReactNode;
}

/**
 * A sidebar component for the application
 */
export function Sidebar({
  children,
  className,
  defaultCollapsed = false,
  collapsible = true,
  title = 'Controls',
  icon,
  ...props
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = () => {
    if (collapsible) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-[60px]' : 'w-[300px]',
        animation.fadeIn,
        className
      )}
      {...props}
    >
      {/* Sidebar header */}
      <div
        className={cn(
          layout.flexBetween,
          'h-14 px-4 border-b border-border',
          collapsed && 'justify-center px-2'
        )}
      >
        {!collapsed && (
          <div className={cn(layout.flexRow, 'gap-2')}>
            {icon}
            <h2 className={cn(typography.h5)}>{title}</h2>
          </div>
        )}
        {collapsible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className={cn('h-8 w-8', animation.buttonPress)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Sidebar content */}
      <div
        className={cn(
          'flex-1 overflow-auto p-4',
          collapsed && 'p-2',
          animation.transition
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center space-y-4">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Upload className="h-5 w-5" />
              <span className="sr-only">Upload</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <BarChart className="h-5 w-5" />
              <span className="sr-only">Charts</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Info className="h-5 w-5" />
              <span className="sr-only">Info</span>
            </Button>
          </div>
        ) : (
          children
        )}
      </div>
    </aside>
  );
}
