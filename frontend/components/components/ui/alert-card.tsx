'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@frontend/components/ui/card';
import { Button } from '@frontend/components/ui/button';
import { Badge } from '@frontend/components/ui/badge';
import { cn } from '@shared/lib/utils';
import { typography, animation, effects, layout } from '@shared/styles/tailwind-utils';

type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

interface AlertCardProps {
  /** Title of the alert */
  title: string;
  /** Description of the alert */
  description: string;
  /** Severity level of the alert */
  severity?: AlertSeverity;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Optional actions to display */
  actions?: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Whether the alert is dismissible */
  dismissible?: boolean;
  /** Callback when the alert is dismissed */
  onDismiss?: () => void;
  /** Optional additional details */
  details?: string;
  /** Optional timestamp */
  timestamp?: string;
  /** Optional location */
  location?: string;
  /** Optional badge text */
  badge?: string;
}

/**
 * A card-based alert component for displaying important information
 */
export function AlertCard({
  title,
  description,
  severity = 'info',
  icon,
  actions,
  className,
  dismissible = false,
  onDismiss,
  details,
  timestamp,
  location,
  badge,
}: AlertCardProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [showDetails, setShowDetails] = React.useState(false);

  // Determine icon based on severity
  let IconComponent = Info;
  let severityColor = 'bg-blue-500/10 text-blue-500 border-blue-500/20';

  switch (severity) {
    case 'error':
      IconComponent = AlertCircle;
      severityColor = 'bg-red-500/10 text-red-500 border-red-500/20';
      break;
    case 'warning':
      IconComponent = AlertTriangle;
      severityColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      break;
    case 'success':
      IconComponent = Info;
      severityColor = 'bg-green-500/10 text-green-500 border-green-500/20';
      break;
    case 'info':
    default:
      IconComponent = Info;
      severityColor = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  }

  if (!isOpen) return null;

  return (
    <Card className={cn('overflow-hidden border', severityColor, animation.fadeIn, className)}>
      <CardHeader className={cn("pb-2", layout.flexBetween, "items-start space-y-0")}>
        <div className={cn(layout.flexRow, "gap-2")}>
          {icon || <IconComponent className="h-5 w-5" />}
          <CardTitle className={cn(typography.h6)}>{title}</CardTitle>
          {badge && (
            <Badge variant="outline" className={cn('ml-2', severityColor)}>
              {badge}
            </Badge>
          )}
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", effects.buttonHover)}
            onClick={() => {
              setIsOpen(false);
              onDismiss?.();
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <CardDescription className={cn(typography.bodySm, "mt-1")}>{description}</CardDescription>

        {(timestamp || location) && (
          <div className={cn(layout.flexRow, "gap-4 mt-2", typography.bodySm, typography.muted)}>
            {timestamp && <div>{timestamp}</div>}
            {location && <div>{location}</div>}
          </div>
        )}

        {details && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={cn("mt-2 h-8 px-2", typography.bodySm, effects.buttonHover)}
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show Details
                </>
              )}
            </Button>

            {showDetails && (
              <div className={cn("mt-2 p-2 bg-background/50", typography.bodySm, effects.rounded, animation.fadeInSlideDown)}>{details}</div>
            )}
          </>
        )}
      </CardContent>

      {actions && <CardFooter className={cn("pt-0", layout.flexEnd, "gap-2")}>{actions}</CardFooter>}
    </Card>
  );
}
