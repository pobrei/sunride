'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, AlertCircle } from 'lucide-react';
import { parseGPX } from '@/features/gpx/utils/gpxParser';
import { useSimpleNotifications } from '@/features/notifications/context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { handleError, ErrorType } from '@/utils/errorHandlers';
import { captureException } from '@/features/monitoring';
import type { GPXData } from '@/features/gpx/types';

interface SimpleGPXUploaderProps {
  onGPXLoaded: (data: GPXData) => void;
  isLoading: boolean;
}

export default function SimpleGPXUploader({ onGPXLoaded, isLoading }: SimpleGPXUploaderProps) {
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get notifications context
  const { addNotification } = useSimpleNotifications();

  const processGpxFile = (file: File) => {
    if (!file) return;

    console.log('Starting GPX file processing:', file.name, `${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();

    reader.onload = event => {
      try {
        console.log('FileReader onload triggered');

        if (!event.target?.result) {
          throw new Error('Failed to read file content');
        }

        const fileContent = event.target.result as string;
        console.log('File content read, starting GPX parsing...');

        const gpxData = parseGPX(fileContent);
        console.log('GPX parsing completed successfully');

        // Validate parsed data
        if (!gpxData.points || gpxData.points.length === 0) {
          throw new Error('No valid route points found in the GPX file');
        }

        // Success!
        console.log('Calling onGPXLoaded callback...');
        onGPXLoaded(gpxData);
        console.log('onGPXLoaded callback completed');

        addNotification(
          'success',
          `Successfully loaded ${gpxData.points.length} points from ${file.name}`
        );
      } catch (err) {
        // Handle error with our utility
        const errorMsg = handleError(err, {
          context: 'GPXUploader',
          errorType: ErrorType.GPX,
          additionalData: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
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
        extra: { fileName: file.name, fileSize: file.size },
      });
    };

    reader.readAsText(file);
  };

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

    // File is validated, now process it automatically
    processGpxFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    validateAndProcessFile(file);
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  // Trigger file input click when drop zone is clicked
  const handleDropZoneClick = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      <div className="pb-2 pt-4 px-4 sm:px-6">
        <h3 className="text-lg font-semibold">Upload GPX File</h3>
      </div>
      <div className="pb-6 px-4 sm:px-6">
        <div className="space-y-4">
          <div className="grid w-full items-center gap-4">
            <Label htmlFor="fileInput" className="text-sm font-medium">
              Select GPX file
            </Label>
            <div
              className={`border-2 border-dashed rounded-xl p-4 transition-all ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-200'} ${isLoading ? 'opacity-50' : 'cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
              data-testid="gpx-drop-zone"
            >
              <div className="flex flex-col items-center justify-center gap-3 text-center py-2">
                <div className="p-3 bg-teal-100 rounded-full">
                  <Upload className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Drag & drop your GPX file here</p>
                  <p className="text-xs text-gray-500">or click to browse files</p>
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
              <div className="flex items-center gap-3 text-sm mt-4 p-3 bg-gray-50 rounded-xl border">
                <div className="flex items-center overflow-hidden w-full">
                  <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0">
                    {isLoading ? (
                      <span className="h-3 w-3 text-teal-500 animate-spin">⟳</span>
                    ) : (
                      <Upload className="h-3 w-3 text-teal-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-sm">
                      {fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isLoading ? 'Processing...' : `${(fileSize / 1024).toFixed(1)} KB`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="py-4 px-4 rounded-xl bg-red-50 border border-red-200 mt-4">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <AlertDescription className="text-sm font-medium text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-gray-500 mt-4 flex items-center gap-1">
              <span className="font-medium">Supported:</span>
              <span>GPX files (.gpx) up to 10MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
