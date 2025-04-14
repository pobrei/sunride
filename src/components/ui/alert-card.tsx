'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/styles/tailwind-utils';

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
  badge
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
    <Card className={cn('overflow-hidden border', severityColor, className)}>
      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-2">
          {icon || <IconComponent className="h-5 w-5" />}
          <CardTitle className="text-base font-medium">{title}</CardTitle>
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
            className="h-8 w-8 p-0" 
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
        <CardDescription className="text-sm mt-1">{description}</CardDescription>
        
        {(timestamp || location) && (
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {timestamp && <div>{timestamp}</div>}
            {location && <div>{location}</div>}
          </div>
        )}
        
        {details && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-8 px-2 text-xs"
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
              <div className="mt-2 p-2 text-xs bg-background/50 rounded-md">
                {details}
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {actions && (
        <CardFooter className="pt-0 flex justify-end gap-2">
          {actions}
        </CardFooter>
      )}
    </Card>
  );
}
