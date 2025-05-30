'use client';

/**
 * MobileNavigation Component
 * 
 * This component provides a mobile-friendly navigation bar
 * following iOS 19 design principles.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Home, Map, BarChart, Upload, Settings, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

interface MobileNavigationProps {
  /** Additional class names */
  className?: string;
  /** Whether to show a logo */
  showLogo?: boolean;
  /** Logo component or image */
  logo?: React.ReactNode;
  /** App title */
  title?: string;
  /** Whether to show theme toggle */
  showThemeToggle?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to use glass effect */
  glass?: boolean;
  /** Whether to use sticky positioning */
  sticky?: boolean;
  /** Custom navigation items */
  navItems?: Array<{
    href: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

/**
 * A mobile-friendly navigation component that follows iOS 19 design principles
 */
export function MobileNavigation({
  className,
  showLogo = true,
  logo,
  title = 'Weather Route',
  showThemeToggle = true,
  bordered = true,
  shadowed = true,
  glass = true,
  sticky = true,
  navItems,
}: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Default navigation items
  const defaultNavItems = [
    {
      href: '/',
      label: 'Home',
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      href: '/map',
      label: 'Map',
      icon: <Map className="h-4 w-4 mr-2" />,
    },
    {
      href: '/charts',
      label: 'Charts',
      icon: <BarChart className="h-4 w-4 mr-2" />,
    },
    {
      href: '/upload',
      label: 'Upload',
      icon: <Upload className="h-4 w-4 mr-2" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ];

  const items = navItems || defaultNavItems;

  return (
    <div
      className={cn(
        'w-full py-2 px-4 flex items-center justify-between z-50',
        bordered && 'border-b border-border/20',
        shadowed && 'shadow-sm',
        glass && 'bg-white/80 dark:bg-card/80 backdrop-blur-md',
        sticky && 'sticky top-0',
        className
      )}
    >
      {/* Logo and title */}
      <div className="flex items-center">
        {showLogo && (
          <div className="mr-2">
            {logo || (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Map className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      {/* Mobile menu */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        {showThemeToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        )}

        {/* Menu button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px] p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-border/20 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation items */}
              <div className="flex-1 overflow-auto py-2">
                <nav className="flex flex-col gap-1 px-2">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        pathname === item.href
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Weather Route
                  </span>
                  {showThemeToggle && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="h-8 rounded-full"
                    >
                      {theme === 'dark' ? (
                        <div className="flex items-center gap-1.5">
                          <Sun className="h-3.5 w-3.5" />
                          <span className="text-xs">Light</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Moon className="h-3.5 w-3.5" />
                          <span className="text-xs">Dark</span>
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default MobileNavigation;
