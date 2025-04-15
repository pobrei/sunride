'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface GPXPoint {
  lat: number;
  lon: number;
  elevation?: number;
  timestamp: number;
  distance: number;
}

export interface GPXData {
  points: GPXPoint[];
  name?: string;
  totalDistance: number;
  totalElevationGain: number;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
}

interface GPXContextType {
  gpxData: GPXData | null;
  setGPXData: (data: GPXData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  uploadGPX: (file: File) => Promise<void>;
}

const GPXContext = createContext<GPXContextType | undefined>(undefined);

export const useGPXContext = () => {
  const context = useContext(GPXContext);
  if (context === undefined) {
    throw new Error('useGPXContext must be used within a GPXProvider');
  }
  return context;
};

interface GPXProviderProps {
  children: ReactNode;
}

export const GPXProvider: React.FC<GPXProviderProps> = ({ children }) => {
  const [gpxData, setGPXData] = useState<GPXData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadGPX = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('gpxFile', file);

      const response = await fetch('/api/gpx/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to parse GPX file');
      }

      const data = await response.json();
      setGPXData(data);
    } catch (err) {
      console.error('Error uploading GPX file:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload GPX file');
      setGPXData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GPXContext.Provider
      value={{
        gpxData,
        setGPXData,
        isLoading,
        setIsLoading,
        error,
        setError,
        uploadGPX,
      }}
    >
      {children}
    </GPXContext.Provider>
  );
};
