'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useWeather } from '@/features/weather/context';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherProviderData {
  provider: string;
  data: (WeatherData | null)[];
  isLoading: boolean;
  error: Error | null;
}

const WeatherProviderComparison: React.FC = () => {
  const { forecastPoints } = useWeather();
  const [providers, setProviders] = useState<WeatherProviderData[]>([
    { provider: 'OpenWeather', data: [], isLoading: false, error: null },
    { provider: 'WeatherAPI', data: [], isLoading: false, error: null },
    { provider: 'VisualCrossing', data: [], isLoading: false, error: null }
  ]);
  const [activeProvider, setActiveProvider] = useState<string>('OpenWeather');
  const [isComparing, setIsComparing] = useState<boolean>(false);

  /**
   * Fetch weather data from a specific provider
   * @param provider - The name of the weather provider
   */
  const fetchProviderData = async (provider: string): Promise<void> => {
    if (forecastPoints.length === 0) return;

    // Find the provider in our state
    const providerIndex: number = providers.findIndex(p => p.provider === provider);
    if (providerIndex === -1) return;

    // Update loading state
    setProviders(prev => {
      const updated: WeatherProviderData[] = [...prev];
      updated[providerIndex] = {
        ...updated[providerIndex],
        isLoading: true,
        error: null
      };
      return updated;
    });

    try {
      // In a real implementation, this would call different API endpoints
      // For this demo, we'll simulate different data with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock data with slight variations based on provider
      const mockData: WeatherData[] = forecastPoints.map((point, index) => {
        const baseTemp: number = 15 + Math.sin(index * 0.5) * 10;
        const baseHumidity: number = 60 + Math.cos(index * 0.3) * 20;
        const baseWind: number = 10 + Math.sin(index * 0.7) * 8;

        // Add provider-specific variations
        let tempAdjust: number = 0;
        let humidityAdjust: number = 0;
        let windAdjust: number = 0;

        if (provider === 'OpenWeather') {
          tempAdjust = 0;
          humidityAdjust = 0;
          windAdjust = 0;
        } else if (provider === 'WeatherAPI') {
          tempAdjust = 1.2;
          humidityAdjust = -5;
          windAdjust = 2;
        } else if (provider === 'VisualCrossing') {
          tempAdjust = -0.8;
          humidityAdjust = 3;
          windAdjust = -1.5;
        }

        return {
          temperature: baseTemp + tempAdjust,
          feelsLike: baseTemp - 2 + tempAdjust,
          humidity: baseHumidity + humidityAdjust,
          pressure: 1013 + Math.sin(index * 0.2) * 10,
          windSpeed: baseWind + windAdjust,
          windDirection: (index * 30) % 360,
          windGust: (baseWind + windAdjust) * 1.5,
          rain: Math.max(0, Math.sin(index * 0.4) * 5),
          snow: 0,
          precipitationProbability: Math.max(0, Math.min(1, Math.sin(index * 0.6) * 0.8)),
          weatherIcon: '01d',
          weatherDescription: 'Clear sky',
          cloudCover: Math.max(0, Math.min(100, Math.sin(index * 0.5) * 50 + 50)),
          visibility: 10000,
          uvIndex: 5,
          timestamp: point.timestamp
        };
      });

      // Update provider data
      setProviders(prev => {
        const updated: WeatherProviderData[] = [...prev];
        updated[providerIndex] = {
          ...updated[providerIndex],
          data: mockData,
          isLoading: false
        };
        return updated;
      });
    } catch (error) {
      // Handle error
      setProviders(prev => {
        const updated: WeatherProviderData[] = [...prev];
        updated[providerIndex] = {
          ...updated[providerIndex],
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error')
        };
        return updated;
      });
    }
  };

  /**
   * Start comparison between all weather providers
   */
  const handleCompare = async (): Promise<void> => {
    setIsComparing(true);

    // Fetch data from all providers
    for (const provider of providers) {
      await fetchProviderData(provider.provider);
    }

    setIsComparing(false);
  };

  // Get the active provider data
  const activeProviderData: WeatherProviderData | undefined = providers.find(p => p.provider === activeProvider);

  // Check if we have data to display
  const hasData: boolean = providers.some(p => p.data.length > 0);

  /**
   * Calculate temperature differences between providers
   * @returns Array of provider comparisons or null if not enough data
   */
  const getTemperatureDifferences = (): Array<{ provider: string; avgDiff: number }> | null => {
    const providersWithData: WeatherProviderData[] = providers.filter(p => p.data.length > 0);
    if (providersWithData.length <= 1) return null;

    // Use the first provider as the baseline
    const baseline: WeatherProviderData = providersWithData[0];

    return providersWithData.slice(1).map(provider => {
      const avgDiff: number = provider.data.reduce((sum, data, index) => {
        if (!data || !baseline.data[index]) return sum;
        return sum + (data.temperature - baseline.data[index]!.temperature);
      }, 0) / provider.data.length;

      return {
        provider: provider.provider,
        baseline: baseline.provider,
        avgDiff: avgDiff.toFixed(1)
      };
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Weather Provider Comparison</CardTitle>
        <CardDescription>
          Compare weather forecasts from different providers to get a more accurate picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Compare weather data from multiple providers to see how forecasts differ along your route.
            </p>
            <Button
              onClick={handleCompare}
              disabled={isComparing || forecastPoints.length === 0}
              className="w-full"
            >
              {isComparing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Fetching data...
                </>
              ) : (
                'Compare Weather Providers'
              )}
            </Button>

            {forecastPoints.length === 0 && (
              <div className="flex items-center p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Please upload a GPX file and generate a forecast first
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue={activeProvider} onValueChange={setActiveProvider}>
              <TabsList className="grid grid-cols-3">
                {providers.map(provider => (
                  <TabsTrigger
                    key={provider.provider}
                    value={provider.provider}
                    disabled={provider.data.length === 0}
                  >
                    {provider.provider}
                  </TabsTrigger>
                ))}
              </TabsList>

              {providers.map(provider => (
                <TabsContent key={provider.provider} value={provider.provider}>
                  {provider.isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : provider.error ? (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-red-800 dark:text-red-300">
                        Error loading data from {provider.provider}: {provider.error.message}
                      </p>
                    </div>
                  ) : provider.data.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Avg. Temperature</p>
                          <p className="text-2xl font-bold">
                            {(provider.data.reduce((sum, data) => sum + (data?.temperature || 0), 0) / provider.data.length).toFixed(1)}°C
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Avg. Humidity</p>
                          <p className="text-2xl font-bold">
                            {Math.round(provider.data.reduce((sum, data) => sum + (data?.humidity || 0), 0) / provider.data.length)}%
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Avg. Wind</p>
                          <p className="text-2xl font-bold">
                            {(provider.data.reduce((sum, data) => sum + (data?.windSpeed || 0), 0) / provider.data.length).toFixed(1)} km/h
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Max Precipitation</p>
                          <p className="text-2xl font-bold">
                            {Math.max(...provider.data.map(data => data?.rain || 0)).toFixed(1)} mm
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-muted rounded-md">
                        <h4 className="font-medium mb-2">Provider Information</h4>
                        <p className="text-sm text-muted-foreground">
                          {provider.provider} provides weather forecasts with updates every 3 hours.
                          Data includes temperature, precipitation, wind, humidity, pressure, and more.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8">
                      <Button
                        variant="outline"
                        onClick={() => fetchProviderData(provider.provider)}
                      >
                        Load {provider.provider} Data
                      </Button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {/* Provider comparison section */}
            {getTemperatureDifferences() && (
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">Provider Comparison</h4>
                <div className="space-y-2">
                  {getTemperatureDifferences()!.map((diff, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>
                        {diff.provider} vs {diff.baseline}:
                      </span>
                      <span className={Number(diff.avgDiff) > 0 ? 'text-red-500' : 'text-blue-500'}>
                        {Number(diff.avgDiff) > 0 ? '+' : ''}{diff.avgDiff}°C
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Values show average temperature differences between providers
                </p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleCompare}
              disabled={isComparing}
              className="w-full"
            >
              {isComparing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh Comparison'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherProviderComparison;
