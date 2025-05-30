'use client';

import React from 'react';
import { Upload, Map, CloudRain, BarChart } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { ExportMenu } from '@/features/export/components';
import type { GPXData } from '@/types';

interface Step {
  label: string;
  description: string;
  status: 'complete' | 'in-progress' | 'pending';
  icon: string;
}

interface PageHeaderProps {
  gpxData: GPXData | null;
  uploadSteps: Step[];
  activeStep: number;
}

// Icon mapping for step icons
const iconMap = {
  upload: Upload,
  map: Map,
  'cloud-rain': CloudRain,
  'bar-chart': BarChart,
};

const PageHeader = React.memo<PageHeaderProps>(({ gpxData, uploadSteps, activeStep }) => {
  // Convert string icons to React components
  const stepsWithIcons = uploadSteps.map(step => ({
    ...step,
    icon: React.createElement(iconMap[step.icon as keyof typeof iconMap] || Upload, { className: "h-3 w-3" })
  }));

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Route Analysis</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SunRide Route Analysis</h1>
          <p className="text-muted-foreground">
            Upload your GPX file to analyze weather conditions along your route
          </p>
        </div>
        
        {gpxData && (
          <div className="flex-shrink-0">
            <ExportMenu />
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="w-full">
        <ProgressSteps 
          steps={stepsWithIcons} 
          activeStep={activeStep}
          className="w-full"
        />
      </div>
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export { PageHeader };
