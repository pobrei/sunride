'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface ResponsiveNavProps {
  /** Navigation sections */
  sections: NavSection[];
  /** Optional className for styling */
  className?: string;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to show badges */
  showBadges?: boolean;
  /** Whether to show section titles */
  showSectionTitles?: boolean;
  /** Whether to use vertical layout (for sidebar) */
  vertical?: boolean;
  /** Whether to collapse on mobile */
  collapsible?: boolean;
  /** Whether to initially collapse on mobile */
  initiallyCollapsed?: boolean;
  /** Whether to use compact styling */
  compact?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to add a border */
  bordered?: boolean;
  /** Whether to add a shadow */
  shadowed?: boolean;
  /** Whether to add a rounded corner */
  rounded?: boolean;
  /** Whether to add a background color */
  background?: boolean;
}

/**
 * A responsive navigation component that follows iOS 19 design principles
 */
export function ResponsiveNav({
  sections,
  className,
  showIcons = true,
  showBadges = true,
  showSectionTitles = true,
  vertical = false,
  collapsible = true,
  initiallyCollapsed = true,
  compact = false,
  glass = false,
  bordered = true,
  shadowed = true,
  rounded = true,
  background = true,
}: ResponsiveNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  
  // Toggle collapsed state
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  // Check if a link is active
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };
  
  // Render a navigation item
  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    
    return (
      <Link
        key={item.href}
        href={item.disabled ? '#' : item.href}
        className={cn(
          'flex items-center gap-2 transition-colors duration-200',
          vertical ? (
            compact ? 'py-1.5 px-2' : 'py-2 px-3'
          ) : (
            compact ? 'py-1.5 px-2' : 'py-2 px-4'
          ),
          rounded && 'rounded-md',
          active ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/80 hover:text-foreground hover:bg-muted/50',
          item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          'relative'
        )}
        onClick={(e) => item.disabled && e.preventDefault()}
      >
        {showIcons && item.icon && (
          <span className={cn(
            'flex-shrink-0',
            active ? 'text-primary' : 'text-muted-foreground'
          )}>
            {item.icon}
          </span>
        )}
        
        <span>{item.label}</span>
        
        {showBadges && item.badge && (
          <span className={cn(
            'ml-auto inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium',
            active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };
  
  return (
    <nav
      className={cn(
        'relative',
        vertical ? 'flex flex-col' : 'flex flex-row',
        background && 'bg-card/80',
        glass && 'backdrop-blur-sm',
        bordered && 'border border-border/40',
        shadowed && 'shadow-sm',
        rounded && 'rounded-lg',
        className
      )}
    >
      {/* Mobile toggle button */}
      {collapsible && !vertical && (
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" x2="21" y1="6" y2="6"></line>
              <line x1="3" x2="21" y1="12" y2="12"></line>
              <line x1="3" x2="21" y1="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          )}
        </button>
      )}
      
      {/* Navigation sections */}
      <div className={cn(
        vertical ? 'flex flex-col w-full' : 'flex flex-row items-center',
        !vertical && collapsible && 'md:flex',
        !vertical && collapsible && collapsed && 'hidden',
        vertical && collapsible && collapsed && 'hidden md:flex md:flex-col'
      )}>
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={cn(
              vertical ? 'flex flex-col w-full' : 'flex flex-row items-center',
              vertical && sectionIndex > 0 && 'mt-4'
            )}
          >
            {showSectionTitles && section.title && (
              <div className={cn(
                'text-xs font-medium text-muted-foreground uppercase tracking-wider',
                vertical ? 'px-3 py-2' : 'px-4 py-2'
              )}>
                {section.title}
              </div>
            )}
            
            <div className={cn(
              vertical ? 'flex flex-col w-full' : 'flex flex-row items-center'
            )}>
              {section.items.map(renderNavItem)}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

export default ResponsiveNav;
