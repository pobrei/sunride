'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface BottomNavProps {
  /** Navigation items */
  items: NavItem[];
  /** Optional className for styling */
  className?: string;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Whether to show badges */
  showBadges?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to add a border */
  bordered?: boolean;
  /** Whether to add a shadow */
  shadowed?: boolean;
  /** Whether to add a background color */
  background?: boolean;
  /** Whether to add a safe area at the bottom (for iOS) */
  safeArea?: boolean;
}

/**
 * A bottom navigation component for mobile devices that follows iOS 19 design principles
 */
export function BottomNav({
  items,
  className,
  showLabels = true,
  showBadges = true,
  glass = true,
  bordered = true,
  shadowed = true,
  background = true,
  safeArea = true,
}: BottomNavProps) {
  const pathname = usePathname();
  
  // Check if a link is active
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };
  
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 md:hidden',
        background && 'bg-card/95',
        glass && 'backdrop-blur-md',
        bordered && 'border-t border-border/40',
        shadowed && 'shadow-lg',
        safeArea && 'pb-safe',
        className
      )}
    >
      <nav className="flex items-center justify-around">
        {items.map((item) => {
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 w-full',
                active ? 'text-primary' : 'text-muted-foreground',
                item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                'relative transition-colors duration-200'
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <div className={cn(
                'relative',
                showBadges && item.badge && 'inline-flex'
              )}>
                <span className="text-[22px]">{item.icon}</span>
                
                {showBadges && item.badge && (
                  <span className={cn(
                    'absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[10px] font-medium',
                    active ? 'bg-primary text-primary-foreground min-w-4 h-4 px-1' : 'bg-muted text-muted-foreground min-w-3 h-3 px-0.5'
                  )}>
                    {item.badge}
                  </span>
                )}
              </div>
              
              {showLabels && (
                <span className={cn(
                  'text-xs mt-1',
                  active ? 'font-medium' : 'font-normal'
                )}>
                  {item.label}
                </span>
              )}
              
              {active && (
                <span className="absolute bottom-0 left-1/2 w-10 h-0.5 bg-primary rounded-t-full transform -translate-x-1/2" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default BottomNav;
