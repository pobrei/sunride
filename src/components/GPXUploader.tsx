'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileX, AlertCircle, FileCheck, Loader2 } from 'lucide-react';
import { parseGPX } from '@/utils/gpxParser';
import type { GPXData } from '@/utils/gpxParser';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/styles/tailwind-utils';

interface GPXUploaderProps {
  /** Callback when GPX file is loaded successfully */
  onGPXLoaded: (data: GPXData) => void;
  /** Whether the parent component is in a loading state */
  isLoading: boolean;
  /** Optional className for styling */
  className?: string;
  /** Optional help text */
  helpText?: string;
  /** Whether to show a progress bar during parsing */
  showProgress?: boolean;
  /** Whether to show a success message after loading */
  showSuccess?: boolean;
}

export default function GPXUploader({
  onGPXLoaded,
  isLoading,
  className,
  helpText = "Upload a GPX file to visualize your route with weather data",
  showProgress = true,
  showSuccess = true
}: GPXUploaderProps) {
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseProgress, setParseProgress] = useState<number>(0);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFileName('');
    setFileSize(0);
    setError(null);
    setIsParsing(false);
    setParseProgress(0);
    setSuccess(false);
    setErrorDetails(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setFileName(file.name);
    setFileSize(file.size);
    setError(null);
    setErrorDetails(null);
    setSuccess(false);

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      setError('Please select a GPX file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    // Start parsing
    setIsParsing(true);
    setParseProgress(10); // Initial progress

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        // Calculate progress for the file reading part (0-50%)
        const progress = Math.round((event.loaded / event.total) * 50);
        setParseProgress(progress);
      }
    };

    reader.onload = (event) => {
      try {
        setParseProgress(60); // Reading complete, start parsing

        if (!event.target?.result) {
          throw new Error('Failed to read file content');
        }

        const fileContent = event.target.result as string;
        setParseProgress(70); // File content loaded

        // Parse GPX data
        const gpxData = parseGPX(fileContent);
        setParseProgress(90); // Parsing complete

        // Validate parsed data
        if (!gpxData.points || gpxData.points.length === 0) {
          throw new Error('No valid route points found in the GPX file');
        }

        // Success!
        setParseProgress(100);
        setSuccess(true);
        setIsParsing(false);
        onGPXLoaded(gpxData);
      } catch (err) {
        console.error('Error parsing GPX:', err);
        setIsParsing(false);
        setError(err instanceof Error ? err.message : 'Invalid GPX file or format not supported');
        setErrorDetails(err instanceof Error ? err.stack || '' : JSON.stringify(err));
      }
    };

    reader.onerror = () => {
      setIsParsing(false);
      setError('Error reading file');
    };

    reader.readAsText(file);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload GPX File
        </CardTitle>
        <CardDescription>{helpText}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="fileInput" className="text-sm flex items-center gap-2">
              Select GPX file
              {isParsing && <LoadingSpinner size="sm" />}
            </Label>

            <div className="flex gap-2">
              <Input
                id="fileInput"
                type="file"
                accept=".gpx"
                onChange={handleFileChange}
                className="cursor-pointer file:bg-primary file:text-primary-foreground file:border-none file:rounded file:px-2.5 file:py-1.5 file:font-medium hover:file:bg-primary/90"
                disabled={isLoading || isParsing}
                ref={fileInputRef}
              />
              <Button
                disabled={isLoading || isParsing || !fileName}
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
              >
                <Upload className="mr-2 h-4 w-4" />
                Browse
              </Button>
            </div>

            {/* File info */}
            {fileName && !error && !isParsing && !success && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <p>
                  {fileName} ({(fileSize / 1024).toFixed(1)} KB) selected
                </p>
              </div>
            )}

            {/* Success state */}
            {success && showSuccess && (
              <Alert variant="default" className="bg-green-500/10 text-green-500 border-green-500/20 py-2">
                <FileCheck className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Successfully loaded {fileName}
                </AlertDescription>
              </Alert>
            )}

            {/* Error state */}
            {error && (
              <ErrorMessage
                message={error}
                details={errorDetails || undefined}
                size="sm"
                onRetry={resetState}
                retryText="Try Another File"
              />
            )}

            {/* Progress bar */}
            {isParsing && showProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Parsing {fileName}...</span>
                  <span className="font-medium">{parseProgress}%</span>
                </div>
                <Progress value={parseProgress} className="h-2" />
              </div>
            )}

            {/* Help text */}
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