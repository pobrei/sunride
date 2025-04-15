'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@frontend/components/ui/card';
import { Button } from '@frontend/components/ui/button';
import { classNames } from '@shared/utils/classNames';
import { LucideIcon, FileQuestion, Plus } from 'lucide-react';

interface EmptyStateProps {
  /** Title of the empty state */
  title: string;
  /** Description of the empty state */
  description: string;
  /** Optional icon to display */
  icon?: LucideIcon;
  /** Optional action button text */
  actionText?: string;
  /** Optional action button function */
  onActionClick?: () => void;
  /** Optional className for styling */
  className?: string;
  /** Height of the card */
  height?: string;
}

/**
 * A component to display when there is no data
 */
export function EmptyState({
  title,
  description,
  icon: Icon = FileQuestion,
  actionText,
  onActionClick,
  className,
  height = 'h-64',
}: EmptyStateProps) {
  return (
    <Card className={classNames('w-full', height, className)} data-testid="empty-state">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center p-6">
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      {actionText && onActionClick && (
        <CardFooter className="justify-center">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onActionClick}
          >
            <Plus className="h-4 w-4" />
            {actionText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
