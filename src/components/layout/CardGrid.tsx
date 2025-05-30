'use client';

/**
 * CardGrid Component
 *
 * This component provides a responsive grid of cards
 * following iOS 19 design principles.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import ResponsiveGrid from './ResponsiveGrid';
import { GridColumns, SpacingSize } from '@/lib/responsive-utils';

/**
 * Card item
 */
export interface CardItem {
  /** Card ID */
  id: string;
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Card content */
  content?: React.ReactNode;
  /** Card footer */
  footer?: React.ReactNode;
  /** Card header */
  header?: React.ReactNode;
  /** Card image */
  image?: string;
  /** Card image alt */
  imageAlt?: string;
  /** Card link */
  href?: string;
  /** Card onClick handler */
  onClick?: () => void;
  /** Card className */
  className?: string;
  /** Card data */
  data?: Record<string, any>;
}

export interface CardGridProps {
  /** Array of card items */
  items: CardItem[];
  /** Additional class names */
  className?: string;
  /** Number of columns on mobile (default: 1) */
  mobileColumns?: GridColumns;
  /** Number of columns on tablet (default: 2) */
  tabletColumns?: GridColumns;
  /** Number of columns on desktop (default: 3) */
  desktopColumns?: GridColumns;
  /** Number of columns on large desktop (default: 4) */
  largeDesktopColumns?: GridColumns;
  /** Gap between items (default: 'md') */
  gap?: SpacingSize | { xs?: SpacingSize; sm?: SpacingSize; md?: SpacingSize; lg?: SpacingSize; xl?: SpacingSize; '2xl'?: SpacingSize; };
  /** Whether to use glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Whether to use equal height cards */
  equalHeight?: boolean;
  /** Whether to use auto-fit instead of fixed columns */
  autoFit?: boolean;
  /** Minimum width for auto-fit columns */
  minItemWidth?: string;
  /** Whether to use hover effect for cards */
  hoverEffect?: boolean;
  /** Whether to use focus effect for cards */
  focusEffect?: boolean;
  /** Whether to use active effect for cards */
  activeEffect?: boolean;
  /** Whether to use animation for cards */
  animated?: boolean;
  /** Additional styles */
  style?: React.CSSProperties;
  /** HTML tag to use */
  as?: React.ElementType;
  /** ID for the grid */
  id?: string;
  /** ARIA label */
  ariaLabel?: string;
  /** ARIA labelledby */
  ariaLabelledby?: string;
  /** ARIA describedby */
  ariaDescribedby?: string;
  /** ARIA role */
  role?: string;
  /** Data attributes */
  data?: Record<string, string>;
  /** Render function for each card */
  renderCard?: (item: CardItem, index: number) => React.ReactNode;
  /** On card click handler */
  onCardClick?: (item: CardItem, index: number) => void;
}

/**
 * A responsive card grid component that follows iOS 19 design principles
 */
export function CardGrid({
  items,
  className,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  largeDesktopColumns = 4,
  gap = 'md',
  glass = true,
  bordered = true,
  shadowed = true,
  rounded = true,
  equalHeight = true,
  autoFit = false,
  minItemWidth = '250px',
  hoverEffect = true,
  focusEffect = true,
  activeEffect = true,
  animated = true,
  style,
  as,
  id,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  role,
  data,
  renderCard,
  onCardClick,
}: CardGridProps) {
  // Generate data attributes
  const dataAttributes: Record<string, string> = {};
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      dataAttributes[`data-${key}`] = value;
    });
  }

  // Default card renderer
  const defaultRenderCard = (item: CardItem, index: number) => {
    const handleClick = () => {
      if (item.onClick) {
        item.onClick();
      }

      if (onCardClick) {
        onCardClick(item, index);
      }
    };

    return (
      <Card
        key={item.id}
        className={cn(
          'overflow-hidden',
          animated && 'animate-fade-in',
          hoverEffect && 'hover:shadow-md hover:border-primary/20 transition-all duration-200',
          focusEffect && 'focus-within:shadow-md focus-within:border-primary/20 transition-all duration-200',
          activeEffect && 'active:shadow-sm active:border-primary/10 transition-all duration-200',
          equalHeight && 'h-full',
          item.className
        )}
        onClick={handleClick}
      >
        {item.header || (item.title || item.description) ? (
          <CardHeader className="pb-2">
            {item.title && <CardTitle>{item.title}</CardTitle>}
            {item.description && <CardDescription>{item.description}</CardDescription>}
          </CardHeader>
        ) : null}

        {item.content && (
          <CardContent>{item.content}</CardContent>
        )}

        {item.footer && (
          <CardFooter>{item.footer}</CardFooter>
        )}
      </Card>
    );
  };

  return (
    <ResponsiveGrid
      mobileColumns={mobileColumns}
      tabletColumns={tabletColumns}
      desktopColumns={desktopColumns}
      largeDesktopColumns={largeDesktopColumns}
      gap={gap}
      autoFit={autoFit}
      minItemWidth={minItemWidth}
      glass={glass}
      bordered={bordered}
      shadowed={shadowed}
      rounded={rounded}
      equalHeight={equalHeight}
      className={className}
      style={style}
      as={as}
      id={id}
      ariaLabel={ariaLabel}
      ariaLabelledby={ariaLabelledby}
      ariaDescribedby={ariaDescribedby}
      role={role}
      data={dataAttributes}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {renderCard ? renderCard(item, index) : defaultRenderCard(item, index)}
        </React.Fragment>
      ))}
    </ResponsiveGrid>
  );
}

export default CardGrid;
