'use client';

import * as React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@shared/lib/utils';

interface ProgressStep {
  /** The label for the step */
  label: string;
  /** Optional description for the step */
  description?: string;
  /** The status of the step */
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  /** Optional icon to display */
  icon?: React.ReactNode;
}

interface ProgressStepsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The steps to display */
  steps: ProgressStep[];
  /** The current active step index */
  activeStep: number;
  /** Whether to show the step numbers */
  showStepNumbers?: boolean;
  /** Whether to show the step descriptions */
  showDescriptions?: boolean;
  /** The orientation of the steps */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * A component that displays a series of steps with their progress
 */
export function ProgressSteps({
  steps,
  activeStep,
  showStepNumbers = false,
  showDescriptions = true,
  orientation = 'horizontal',
  className,
  ...props
}: ProgressStepsProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={cn(
        'w-full',
        isVertical ? 'flex flex-col space-y-4' : 'flex items-center justify-between',
        className
      )}
      {...props}
    >
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isComplete = index < activeStep || step.status === 'complete';
        const isError = step.status === 'error';
        const isInProgress = step.status === 'in-progress';

        return (
          <div
            key={index}
            className={cn(
              'relative flex',
              isVertical ? 'items-start' : 'flex-col items-center',
              !isVertical && 'flex-1'
            )}
          >
            {/* Connector line */}
            {index > 0 && (
              <div
                className={cn(
                  isVertical
                    ? 'absolute left-3 top-0 h-full w-0.5 -translate-x-1/2 -translate-y-1/2'
                    : 'absolute top-3 h-0.5 w-full -translate-y-1/2 left-0',
                  isComplete ? 'bg-primary' : 'bg-muted'
                )}
                aria-hidden="true"
              />
            )}

            {/* Step indicator */}
            <div
              className={cn(
                'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                isActive && !isComplete && !isError && 'border-primary bg-background',
                isComplete && 'border-primary bg-primary text-primary-foreground',
                isError && 'border-destructive bg-destructive text-destructive-foreground',
                !isActive && !isComplete && !isError && 'border-muted bg-muted/40',
                isVertical ? 'mr-3' : 'mb-2'
              )}
            >
              {isComplete ? (
                <Check className="h-3 w-3" />
              ) : isError ? (
                <span className="text-xs font-medium">!</span>
              ) : isInProgress ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                showStepNumbers && <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>

            {/* Step content */}
            <div
              className={cn(
                'flex flex-col',
                isVertical ? 'mt-0' : 'mt-2 text-center',
                isVertical && 'flex-1'
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  isActive && 'text-foreground',
                  isComplete && 'text-foreground',
                  isError && 'text-destructive',
                  !isActive && !isComplete && !isError && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
              {showDescriptions && step.description && (
                <span className="mt-0.5 text-xs text-muted-foreground">{step.description}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
