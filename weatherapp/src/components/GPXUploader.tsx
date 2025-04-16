'use client';

import { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { parseGPX } from '@/utils/gpxParser';
import type { GPXData } from '@/types';

interface GPXUploaderProps {
  onGPXLoaded: (data: GPXData) => void;
  isLoading: boolean;
}

/**
 * Status indicator component for file upload
 */
const FileStatus = ({ fileName, error }: { fileName: string | null; error: string | null }) => {
  if (error) {
    return (
      <div className="text-sm text-destructive mt-1 flex items-center">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive mr-2"></span>
        {error}
      </div>
    );
  }

  if (fileName) {
    return (
      <div className="text-sm text-[#6b7280] dark:text-muted-foreground mt-1 flex items-center">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></span>
        <span className="font-medium">{fileName}</span> selected
      </div>
    );
  }

  return null;
};

/**
 * GPX file uploader component
 * Allows users to upload GPX route files
 */
function GPXUploader({ onGPXLoaded, isLoading }: GPXUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle file selection and parsing
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      setError('Please select a GPX file');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        // Parse GPX data from file content
        const fileContent = event.target?.result as string;
        if (!fileContent) {
          throw new Error('Failed to read file content');
        }

        const gpxData = parseGPX(fileContent);
        onGPXLoaded(gpxData);
      } catch (err) {
        console.error('Error parsing GPX:', err);
        setError('Invalid GPX file or format not supported');
      }
    };

    reader.onerror = () => {
      setError('Failed to read the file. Please try again.');
    };

    reader.readAsText(file);
  }, [onGPXLoaded]);

  return (
    <Card className="card-shadow-sm border border-border/50 rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-lg font-semibold flex items-center">
          <div className="bg-primary/10 p-1.5 rounded-full mr-2">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          Upload GPX File
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label
              htmlFor="fileInput"
              className="text-sm font-medium text-[#374151] dark:text-foreground"
            >
              Select a GPX route file to upload
            </Label>
            <div className="flex gap-2">
              <Input
                id="fileInput"
                type="file"
                accept=".gpx"
                onChange={handleFileChange}
                className="flex-1 border-border/50 bg-white dark:bg-background rounded-lg file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:font-medium file:px-3 file:py-2 hover:file:bg-primary/20 transition-colors"
                aria-label="Upload GPX file"
                disabled={isLoading}
              />
              <Button
                disabled={isLoading || !fileName}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-sm"
                aria-label="Upload GPX file"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>

            <FileStatus fileName={fileName} error={error} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(GPXUploader);