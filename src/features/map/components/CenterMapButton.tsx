'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Locate } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typography, animation, effects, layout } from '@/styles/tailwind-utils';

interface CenterMapButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * A button that centers the map on the route
 */
export function CenterMapButton({ onClick, className }: CenterMapButtonProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn(
        "absolute z-10 shadow-md",
        animation.buttonPress,
        effects.buttonHover,
        className
      )}
      onClick={onClick}
      aria-label="Center map on route"
    >
      <Locate className="h-4 w-4 mr-2" />
      Center Map
    </Button>
  );
}

export default CenterMapButton;
