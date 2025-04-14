'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, AlertCircle, FileX } from 'lucide-react';
import { parseGPX } from '@/features/gpx/utils/gpxParser';
import { useSimpleNotifications } from '@/features/notifications/context';
import { createSafeContext } from '@/utils/createSafeContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { handleError, ErrorType } from '@/utils/errorHandlers';
import { captureException } from '@/features/monitoring';
import type { GPXData } from '@/features/gpx/types';

interface GPXUploaderProps {
  onGPXLoaded: (data: GPXData) => void;
  isLoading: boolean;
}

export default function GPXUploader({ onGPXLoaded, isLoading }: GPXUploaderProps) {
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);

  // Try to use notifications context, but don't crash if it's not available
  let notificationContext;
  try {
    notificationContext = useSimpleNotifications();
  } catch (e) {
    // If context is not available, provide a fallback
    notificationContext = {
      addNotification: (type: string, message: string) => {
        console.log(`[Notification] ${type}: ${message}`);
        return '';
      }
    };
  }

  const { addNotification } = notificationContext;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setError(null);

    // Validate file type
    const validExtensions = ['.gpx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      const errorMsg = `Please select a GPX file. Received: ${fileExtension}`;
      setError(errorMsg);
      addNotification('error', errorMsg);
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const errorMsg = `File is too large (${sizeMB}MB). Maximum size is 10MB.`;
      setError(errorMsg);
      addNotification('error', errorMsg);
      return;
    }

    // Read and parse the file
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file content');
        }

        const fileContent = event.target.result as string;
        const gpxData = parseGPX(fileContent);

        // Validate parsed data
        if (!gpxData.points || gpxData.points.length === 0) {
          throw new Error('No valid route points found in the GPX file');
        }

        // Success!
        onGPXLoaded(gpxData);
        addNotification('success', `Successfully loaded ${gpxData.points.length} points from ${file.name}`);
      } catch (err) {
        // Handle error with our utility
        const errorMsg = handleError(err, {
          context: 'GPXUploader',
          errorType: ErrorType.GPX,
          additionalData: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        });

        setError(errorMsg);
        addNotification('error', 'Failed to parse GPX file: ' + errorMsg);
      }
    };

    reader.onerror = () => {
      const errorMsg = 'Error reading file';
      setError(errorMsg);
      addNotification('error', errorMsg);
      captureException(new Error('FileReader error'), {
        tags: { context: 'GPXUploader' },
        extra: { fileName: file.name, fileSize: file.size }
      });
    };

    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Upload GPX File</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="fileInput" className="text-sm">
              Select GPX file
            </Label>
            <div className="flex gap-2" data-testid="gpx-drop-zone">
              <Input
                id="fileInput"
                type="file"
                accept=".gpx"
                onChange={handleFileChange}
                className="cursor-pointer file:bg-primary file:text-primary-foreground file:border-none file:rounded file:px-2.5 file:py-1.5 file:font-medium hover:file:bg-primary/90"
                disabled={isLoading}
                data-testid="gpx-file-input"
              />
              <Button
                disabled={isLoading || !fileName || !!error}
                data-testid="upload-button"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>

            {fileName && !error && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <p>
                  {fileName} ({(fileSize / 1024).toFixed(1)} KB) selected
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-muted-foreground mt-1">
              <p>Supported file:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>GPX files (.gpx) up to 10MB</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}