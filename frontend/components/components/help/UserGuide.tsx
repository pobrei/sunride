'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  ChevronRight,
  Upload,
  Map,
  BarChart3,
  Clock,
  Settings,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Button } from '@frontend/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@frontend/components/ui/card';
import { cn } from '@shared/styles/tailwind-utils';

interface UserGuideProps {
  /** Optional className for styling */
  className?: string;
}

/**
 * A component that displays a user guide for the application
 */
export function UserGuide({ className }: UserGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Upload GPX File',
      description:
        'Start by uploading a GPX file containing your route data. The application will parse the file and display your route on the map.',
      icon: <Upload className="h-5 w-5" />,
    },
    {
      title: 'View Route on Map',
      description:
        'Your route will be displayed on the map with markers for each forecast point. Click on a marker to see detailed weather information for that point.',
      icon: <Map className="h-5 w-5" />,
    },
    {
      title: 'Explore Timeline',
      description:
        'The timeline shows weather conditions at different points along your route. Click on a timeline item to highlight the corresponding point on the map.',
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: 'Analyze Weather Data',
      description:
        'View detailed weather charts showing temperature, precipitation, wind speed, and elevation data along your route.',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: 'Check Weather Alerts',
      description:
        'The application will automatically detect potential weather hazards along your route and display alerts for extreme conditions.',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      title: 'Adjust Settings',
      description:
        'Customize your route settings including weather interval, start time, and average speed to get more accurate forecasts.',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: 'Export Your Plan',
      description:
        'Export your route plan as a PDF document including the map, weather data, and alerts for offline reference.',
      icon: <Download className="h-5 w-5" />,
    },
  ];

  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      setIsOpen(false);
      setActiveStep(0);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 flex items-center gap-2 shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="h-4 w-4" />
        Help Guide
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          <CardTitle className="text-xl">RideWeather Guide</CardTitle>
          <CardDescription>
            Step {activeStep + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              {steps[activeStep].icon}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium">{steps[activeStep].title}</h3>
              <p className="text-sm text-muted-foreground">{steps[activeStep].description}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={handlePrevStep} disabled={activeStep === 0}>
            Previous
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleNextStep}
            className="flex items-center gap-1"
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
