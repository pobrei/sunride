'use client';

import { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FileDown, FileText, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';
import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { useNotifications } from '@/features/notifications/context';
import { exportToPDF } from '../utils/pdfExport';
import { exportToCSV } from '../utils/csvExport';
import { exportToJSON } from '../utils/jsonExport';
import { exportToGPX } from '../utils/gpxExport';

interface ExportMenuProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  mapRef: React.RefObject<HTMLDivElement>;
  chartsRef: React.RefObject<HTMLDivElement>;
}

export default function ExportMenu({
  gpxData,
  forecastPoints,
  weatherData,
  mapRef,
  chartsRef,
}: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const handleExport = async (format: 'pdf' | 'csv' | 'json' | 'gpx') => {
    if (!gpxData || forecastPoints.length === 0) {
      addNotification('error', 'No data available to export');
      return;
    }

    setIsExporting(format);

    try {
      let success = false;
      const routeName = gpxData.name || 'Route';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${routeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}`;

      switch (format) {
        case 'pdf':
          success = await exportToPDF({
            gpxData,
            forecastPoints,
            weatherData,
            mapRef,
            chartsRef,
            filename: `${filename}.pdf`
          });
          break;
        case 'csv':
          success = await exportToCSV({
            gpxData,
            forecastPoints,
            weatherData,
            filename: `${filename}.csv`
          });
          break;
        case 'json':
          success = await exportToJSON({
            gpxData,
            forecastPoints,
            weatherData,
            filename: `${filename}.json`
          });
          break;
        case 'gpx':
          success = await exportToGPX({
            gpxData,
            forecastPoints,
            weatherData,
            filename: `${filename}.gpx`
          });
          break;
      }

      if (success) {
        addNotification('success', `Successfully exported to ${format.toUpperCase()}`);
      } else {
        addNotification('error', `Failed to export to ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      addNotification('error', `Error exporting to ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(null);
    }
  };

  const isDisabled = !gpxData || forecastPoints.length === 0 || isExporting !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-white dark:bg-[#1E2A38] hover:bg-gray-50 dark:hover:bg-[#2D3748] text-[#1A1A1A] dark:text-white border-[#E5E7EB] dark:border-[#2D3748] hover:border-[#00C2A8]/50 transition-all duration-300"
          disabled={isDisabled}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#1E2A38] border-[#E5E7EB] dark:border-[#2D3748]">
        <DropdownMenuLabel className="text-[#1A1A1A] dark:text-white">Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#E5E7EB] dark:bg-[#2D3748]" />
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={isDisabled}
          className="cursor-pointer hover:bg-[#00C2A8]/10 dark:hover:bg-[#00C2A8]/20 text-[#1A1A1A] dark:text-white focus:bg-[#00C2A8]/10 dark:focus:bg-[#00C2A8]/20"
        >
          <FileText className="mr-2 h-4 w-4 text-[#00C2A8]" />
          <span>PDF Report</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          disabled={isDisabled}
          className="cursor-pointer hover:bg-[#00C2A8]/10 dark:hover:bg-[#00C2A8]/20 text-[#1A1A1A] dark:text-white focus:bg-[#00C2A8]/10 dark:focus:bg-[#00C2A8]/20"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-[#00C2A8]" />
          <span>CSV Spreadsheet</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('json')}
          disabled={isDisabled}
          className="cursor-pointer hover:bg-[#00C2A8]/10 dark:hover:bg-[#00C2A8]/20 text-[#1A1A1A] dark:text-white focus:bg-[#00C2A8]/10 dark:focus:bg-[#00C2A8]/20"
        >
          <FileJson className="mr-2 h-4 w-4 text-[#00C2A8]" />
          <span>JSON Data</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('gpx')}
          disabled={isDisabled}
          className="cursor-pointer hover:bg-[#00C2A8]/10 dark:hover:bg-[#00C2A8]/20 text-[#1A1A1A] dark:text-white focus:bg-[#00C2A8]/10 dark:focus:bg-[#00C2A8]/20"
        >
          <FileDown className="mr-2 h-4 w-4 text-[#00C2A8]" />
          <span>GPX with Weather</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
