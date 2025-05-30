'use client';

/**
 * BottomNavigation Component
 * 
 * This component provides a mobile-friendly bottom navigation bar
 * following iOS 19 design principles.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, BarChart, Upload, Settings } from 'lucide-react';

interface BottomNavigationProps {
  /** Additional class names */
  className?: string;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to use glass effect */
  glass?: boolean;
  /** Whether to use sticky positioning */
  sticky?: boolean;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Custom navigation items */
  navItems?: Array<{
    href: string;
    label: string;
    icon: React.ReactNode;
  }>;
}

/**
 * A mobile-friendly bottom navigation component that follows iOS 19 design principles
 */
export function BottomNavigation({
  className,
  bordered = true,
  shadowed = true,
  glass = true,
  sticky = true,
  showLabels = true,
  navItems,
}: BottomNavigationProps) {
  const pathname = usePathname();

  // Default navigation items
  const defaultNavItems = [
    {
      href: '/',
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: '/map',
      label: 'Map',
      icon: <Map className="h-5 w-5" />,
    },
    {
      href: '/charts',
      label: 'Charts',
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      href: '/upload',
      label: 'Upload',
      icon: <Upload className="h-5 w-5" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const items = navItems || defaultNavItems;

  return (
    <div
      className={cn(
        'md:hidden w-full py-2 px-4 flex items-center justify-around z-50',
        bordered && 'border-t border-border/20',
        shadowed && 'shadow-[0_-2px_10px_rgba(0,0,0,0.05)]',
        glass && 'bg-white/80 dark:bg-card/80 backdrop-blur-md',
        sticky && 'fixed bottom-0 left-0 right-0',
        className
      )}
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center',
                isActive && 'bg-primary/10 p-2 rounded-full'
              )}
            >
              {item.icon}
            </div>
            {showLabels && (
              <span className={cn('text-[10px] mt-1 font-medium', isActive && 'font-semibold')}>
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default BottomNavigation;
