'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Keyboard,
  X,
} from 'lucide-react';

// Import from features
import { useWeather } from '@/features/weather/context';

// Import from components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { effects, typography, layout, animation } from '@/styles/tailwind-utils';

interface KeyboardNavigationProps {
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onZoom: (direction: 'in' | 'out') => void;
  onSelectMarker: (index: number | null) => void;
  markerCount: number;
}

const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  onNavigate,
  onZoom,
  onSelectMarker,
  markerCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMarker, setCurrentMarker] = useState<number | null>(null);
  const { selectedMarker } = useWeather();

  // Sync with the selected marker from context
  useEffect(() => {
    setCurrentMarker(selectedMarker);
  }, [selectedMarker]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onNavigate('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          onNavigate('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate('right');
          break;
        case '+':
        case '=':
          e.preventDefault();
          onZoom('in');
          break;
        case '-':
        case '_':
          e.preventDefault();
          onZoom('out');
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          if (markerCount > 0) {
            const nextMarker = currentMarker === null ? 0 : (currentMarker + 1) % markerCount;
            setCurrentMarker(nextMarker);
            onSelectMarker(nextMarker);
          }
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          if (markerCount > 0) {
            const prevMarker =
              currentMarker === null
                ? markerCount - 1
                : (currentMarker - 1 + markerCount) % markerCount;
            setCurrentMarker(prevMarker);
            onSelectMarker(prevMarker);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onNavigate, onZoom, onSelectMarker, currentMarker, markerCount]);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute bottom-4 left-4 z-[1000]",
          effects.glassmorphism
        )}
        onClick={() => setIsOpen(true)}
        aria-label="Enable keyboard navigation"
      >
        <Keyboard className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "absolute bottom-4 left-4 z-[1000]",
        effects.glassmorphism,
        animation.fadeIn
      )}
      variant="ghost"
      size="sm"
    >
      <CardHeader className="py-2 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className={cn(typography.h6)}>Keyboard Navigation</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
            aria-label="Close keyboard navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="py-2 px-4">

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div></div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onNavigate('up')}
          aria-label="Navigate up"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div></div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onNavigate('left')}
          aria-label="Navigate left"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div></div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onNavigate('right')}
          aria-label="Navigate right"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div></div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onNavigate('down')}
          aria-label="Navigate down"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <div></div>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onZoom('in')}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onZoom('out')}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {markerCount > 0 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const prevMarker =
                currentMarker === null
                  ? markerCount - 1
                  : (currentMarker - 1 + markerCount) % markerCount;
              setCurrentMarker(prevMarker);
              onSelectMarker(prevMarker);
            }}
            aria-label="Previous marker"
          >
            Prev (P)
          </Button>
          <span className="text-xs">
            {currentMarker !== null
              ? `Marker ${currentMarker + 1}/${markerCount}`
              : 'No marker selected'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextMarker = currentMarker === null ? 0 : (currentMarker + 1) % markerCount;
              setCurrentMarker(nextMarker);
              onSelectMarker(nextMarker);
            }}
            aria-label="Next marker"
          >
            Next (N)
          </Button>
        </div>
      )}

      </CardContent>

      <CardFooter className="py-2 px-4">
        <div className={cn(typography.bodySm, typography.muted)}>
          Press <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> to close
        </div>
      </CardFooter>
    </Card>
  );
};

export default KeyboardNavigation;
