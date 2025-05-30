'use client';

/**
 * ResponsiveTable Component
 * 
 * This component provides a responsive table that adapts to mobile screens
 * following iOS 19 design principles.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { ScrollArea } from './scroll-area';

interface Column<T> {
  /** Column header */
  header: string;
  /** Column accessor (key in data object) */
  accessor: keyof T;
  /** Column cell renderer */
  cell?: (value: any, row: T) => React.ReactNode;
  /** Whether to hide this column on mobile */
  hideOnMobile?: boolean;
  /** Column width */
  width?: string;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether this column is sortable */
  sortable?: boolean;
}

interface ResponsiveTableProps<T> {
  /** Table data */
  data: T[];
  /** Table columns */
  columns: Column<T>[];
  /** Additional class names */
  className?: string;
  /** Whether to use a card container */
  withCard?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Whether to use zebra striping */
  striped?: boolean;
  /** Whether to show hover effects */
  hoverable?: boolean;
  /** Whether to use a compact layout */
  compact?: boolean;
  /** Whether to use a scrollable container */
  scrollable?: boolean;
  /** Maximum height for scrollable container */
  maxHeight?: string;
  /** Whether to show a mobile card view on small screens */
  mobileCards?: boolean;
  /** Function to get a unique key for each row */
  getRowKey?: (row: T) => string | number;
  /** Function called when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Whether to show a loading state */
  loading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Text to show when there is no data */
  emptyText?: string;
  /** Whether to show a header */
  showHeader?: boolean;
  /** Whether to show a footer */
  showFooter?: boolean;
  /** Footer content */
  footer?: React.ReactNode;
}

/**
 * A responsive table component that follows iOS 19 design principles
 */
export function ResponsiveTable<T extends object>({
  data,
  columns,
  className,
  withCard = true,
  glass = true,
  bordered = true,
  shadowed = true,
  rounded = true,
  striped = true,
  hoverable = true,
  compact = false,
  scrollable = true,
  maxHeight = '500px',
  mobileCards = true,
  getRowKey = (row: T, index: number) => index,
  onRowClick,
  loading = false,
  loadingText = 'Loading data...',
  emptyText = 'No data available',
  showHeader = true,
  showFooter = false,
  footer,
}: ResponsiveTableProps<T>) {
  // Table content
  const tableContent = (
    <>
      {/* Desktop table */}
      <div className={cn('w-full', mobileCards && 'hidden md:block')}>
        <div className={cn('w-full', scrollable && 'overflow-auto')}>
          <ScrollArea className={scrollable ? maxHeight : ''}>
            <table className="w-full border-collapse">
              {showHeader && (
                <thead>
                  <tr className="border-b border-border/40">
                    {columns.map((column) => (
                      <th
                        key={column.accessor.toString()}
                        className={cn(
                          'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.width && column.width
                        )}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
                        <span>{loadingText}</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      {emptyText}
                    </td>
                  </tr>
                ) : (
                  data.map((row, rowIndex) => (
                    <tr
                      key={typeof getRowKey === 'function' ? getRowKey(row) : rowIndex}
                      className={cn(
                        'border-b border-border/20 last:border-0',
                        striped && rowIndex % 2 === 1 && 'bg-muted/30',
                        hoverable && 'hover:bg-muted/50 transition-colors',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick && onRowClick(row)}
                    >
                      {columns.map((column) => (
                        <td
                          key={`${rowIndex}-${column.accessor.toString()}`}
                          className={cn(
                            'px-4 py-3 text-sm',
                            compact && 'px-3 py-2',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {column.cell
                            ? column.cell(row[column.accessor], row)
                            : row[column.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile card view */}
      {mobileCards && (
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
                <span>{loadingText}</span>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            data.map((row, rowIndex) => (
              <Card
                key={typeof getRowKey === 'function' ? getRowKey(row) : rowIndex}
                className={cn(
                  'overflow-hidden',
                  onRowClick && 'cursor-pointer'
                )}
                variant={glass ? 'glass' : 'default'}
                hover={hoverable ? 'lift' : 'none'}
                bordered={bordered}
                shadowed={shadowed}
                rounded={rounded ? 'xl' : 'lg'}
                onClick={() => onRowClick && onRowClick(row)}
              >
                <div className="divide-y divide-border/20">
                  {columns
                    .filter((column) => !column.hideOnMobile)
                    .map((column) => (
                      <div
                        key={`${rowIndex}-${column.accessor.toString()}`}
                        className="flex justify-between items-center p-3"
                      >
                        <div className="text-xs font-medium text-muted-foreground">
                          {column.header}
                        </div>
                        <div className="text-sm">
                          {column.cell
                            ? column.cell(row[column.accessor], row)
                            : row[column.accessor]}
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Footer */}
      {showFooter && footer && (
        <div className="mt-4 border-t border-border/20 pt-4">
          {footer}
        </div>
      )}
    </>
  );

  // Render with or without card container
  return withCard ? (
    <Card
      className={cn('overflow-hidden', className)}
      variant={glass ? 'glass' : 'default'}
      bordered={bordered}
      shadowed={shadowed}
      rounded={rounded ? 'xl' : 'lg'}
    >
      <div className="p-4">{tableContent}</div>
    </Card>
  ) : (
    <div className={className}>{tableContent}</div>
  );
}

export default ResponsiveTable;
