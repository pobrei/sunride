'use client';

/**
 * MobileTabs Component
 * 
 * This component provides a mobile-friendly tab interface with swipe navigation
 * following iOS 19 design principles.
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import SwipeContainer from './swipe-container';

interface MobileTabsProps {
  /** Tab items */
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
  }>;
  /** Default selected tab ID */
  defaultTab?: string;
  /** Additional class names */
  className?: string;
  /** Whether to enable swipe navigation */
  enableSwipe?: boolean;
  /** Whether to show navigation arrows */
  showArrows?: boolean;
  /** Whether to use a sticky header */
  stickyHeader?: boolean;
  /** Whether to show tab indicators */
  showIndicators?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Function called when tab changes */
  onTabChange?: (tabId: string) => void;
}

/**
 * A mobile-friendly tab component with swipe navigation
 * following iOS 19 design principles
 */
export function MobileTabs({
  tabs,
  defaultTab,
  className,
  enableSwipe = true,
  showArrows = true,
  stickyHeader = true,
  showIndicators = true,
  glass = true,
  bordered = true,
  shadowed = true,
  rounded = true,
  onTabChange,
}: MobileTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [scrollPosition, setScrollPosition] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (tabs.find(tab => tab.id === tabId)?.disabled) return;
    
    setActiveTab(tabId);
    onTabChange?.(tabId);
    
    // Scroll the tab into view
    if (tabsRef.current) {
      const tabElement = tabsRef.current.querySelector(`[data-tab-id="${tabId}"]`);
      if (tabElement) {
        tabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  };

  // Handle scroll
  const handleScroll = () => {
    if (tabsRef.current) {
      setScrollPosition(tabsRef.current.scrollLeft);
    }
  };

  // Handle swipe navigation
  const handleSwipeLeft = () => {
    if (!enableSwipe) return;
    
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      if (!nextTab.disabled) {
        handleTabChange(nextTab.id);
      }
    }
  };

  const handleSwipeRight = () => {
    if (!enableSwipe) return;
    
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      const prevTab = tabs[currentIndex - 1];
      if (!prevTab.disabled) {
        handleTabChange(prevTab.id);
      }
    }
  };

  // Update scroll position when active tab changes
  useEffect(() => {
    if (tabsRef.current) {
      const tabElement = tabsRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
      if (tabElement) {
        tabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeTab]);

  return (
    <div
      className={cn(
        'flex flex-col w-full overflow-hidden',
        rounded && 'rounded-xl',
        bordered && 'border border-border/20',
        shadowed && 'shadow-sm',
        glass && 'bg-card/80 backdrop-blur-sm',
        className
      )}
    >
      {/* Tab header */}
      <div
        className={cn(
          'relative',
          stickyHeader && 'sticky top-0 z-10 bg-card/95 backdrop-blur-sm'
        )}
      >
        {/* Left arrow */}
        {showArrows && scrollPosition > 10 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm shadow-sm border border-border/20"
            onClick={() => {
              if (tabsRef.current) {
                tabsRef.current.scrollBy({ left: -200, behavior: 'smooth' });
              }
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Tab buttons */}
        <div
          ref={tabsRef}
          className="flex overflow-x-auto scrollbar-none py-2 px-4"
          onScroll={handleScroll}
        >
          <div className="flex space-x-2 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                  tab.disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => handleTabChange(tab.id)}
                disabled={tab.disabled}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right arrow */}
        {showArrows && tabsRef.current && (
          scrollPosition < tabsRef.current.scrollWidth - tabsRef.current.clientWidth - 10
        ) && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm shadow-sm border border-border/20"
            onClick={() => {
              if (tabsRef.current) {
                tabsRef.current.scrollBy({ left: 200, behavior: 'smooth' });
              }
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Tab indicators */}
        {showIndicators && (
          <div className="flex justify-center space-x-1 py-1">
            {tabs.map(tab => (
              <div
                key={`indicator-${tab.id}`}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  activeTab === tab.id
                    ? 'w-4 bg-primary'
                    : 'w-1 bg-muted',
                  tab.disabled && 'opacity-50'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tab content */}
      <SwipeContainer
        ref={contentRef}
        className="flex-1 overflow-hidden"
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        disabled={!enableSwipe}
        showFeedback={true}
      >
        <div className="h-full overflow-auto p-4">
          {tabs.map(tab => (
            <div
              key={`content-${tab.id}`}
              className={cn(
                'transition-opacity duration-300',
                activeTab === tab.id ? 'block opacity-100' : 'hidden opacity-0'
              )}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </SwipeContainer>
    </div>
  );
}

export default MobileTabs;
