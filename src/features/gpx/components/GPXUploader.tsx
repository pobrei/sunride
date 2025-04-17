'use client';

import { useState, useRef, useCallback } from 'react';
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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      },
    };
  }

  const { addNotification } = notificationContext;

  const validateAndProcessFile = (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setSelectedFile(file);
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

    // File is validated and stored in state
    // It will be processed when the user clicks the Process button
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    validateAndProcessFile(file);
  };

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  }, []);

  // Trigger file input click when drop zone is clicked
  const handleDropZoneClick = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload GPX File</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="fileInput">
              Select GPX file
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${isDragging ? 'border-primary bg-primary/5' : 'border-border'} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50 hover:bg-primary/5'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
              data-testid="gpx-drop-zone"
            >
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Drag & drop your GPX file here</p>
                  <p className="text-xs text-muted-foreground">or click to browse files</p>
                </div>
                <Input
                  ref={fileInputRef}
                  id="fileInput"
                  type="file"
                  accept=".gpx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                  data-testid="gpx-file-input"
                />
              </div>
            </div>

            {fileName && !error && (
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                <p>
                  {fileName} ({(fileSize / 1024).toFixed(1)} KB) selected
                </p>
                <Button
                  onClick={() => {
                    if (selectedFile) {
                      const reader = new FileReader();

                      reader.onload = event => {
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
                          addNotification(
                            'success',
                            `Successfully loaded ${gpxData.points.length} points from ${selectedFile.name}`
                          );
                        } catch (err) {
                          // Handle error with our utility
                          const errorMsg = handleError(err, {
                            context: 'GPXUploader',
                            errorType: ErrorType.GPX,
                            additionalData: {
                              fileName: selectedFile.name,
                              fileSize: selectedFile.size,
                              fileType: selectedFile.type,
                            },
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
                          extra: { fileName: selectedFile.name, fileSize: selectedFile.size },
                        });
                      };

                      reader.readAsText(selectedFile);
                    }
                  }}
                  disabled={isLoading || !selectedFile}
                  className="h-8 px-3"
                  data-testid="process-button"
                >
                  <Upload className="mr-2 h-3 w-3" />
                  Process File
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
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
