'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertTriangle, Cloud, Thermometer, Droplets, Wind } from 'lucide-react';
import { useSimpleNotifications } from '@/features/notifications/context';
import { handleError, ErrorType } from '@/utils/errorHandlers';
import { captureException } from '@/features/monitoring';
import type { ForecastPoint, WeatherProvider } from '@/features/weather/types';

// Mock function for fetchWeatherComparison
const fetchWeatherComparison = async (points: ForecastPoint[]) => {
  // This is a mock implementation
  return [
    {
      id: 'openweather',
      name: 'OpenWeather',
      isPremium: false,
      data: points.map(() => ({
        temperature: 20 + Math.random() * 5,
        humidity: 60 + Math.random() * 20,
        windSpeed: 2 + Math.random() * 3,
        rain: Math.random() * 2,
      })),
    },
    {
      id: 'weatherapi',
      name: 'WeatherAPI',
      isPremium: true,
      data: points.map(() => ({
        temperature: 21 + Math.random() * 5,
        humidity: 65 + Math.random() * 15,
        windSpeed: 2.5 + Math.random() * 3,
        rain: Math.random() * 1.5,
      })),
    },
  ];
};

interface WeatherProviderComparisonProps {
  forecastPoints: ForecastPoint[];
}

export default function SimpleWeatherProviderComparison({ forecastPoints = [] }: WeatherProviderComparisonProps) {
  const [isComparing, setIsComparing] = useState(false);
  const [providers, setProviders] = useState<WeatherProvider[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const { addNotification } = useSimpleNotifications();

  const handleCompare = async () => {
    if (!forecastPoints || forecastPoints.length === 0) {
      addNotification('warning', 'Please upload a GPX file and generate a forecast first');
      return;
    }

    setIsComparing(true);

    try {
      // Get a sample of points (e.g., every 3rd point) to reduce API calls
      const samplePoints = forecastPoints.filter((_, index) => index % 3 === 0);

      // Fetch weather data from multiple providers
      const comparisonData = await fetchWeatherComparison(samplePoints);

      setProviders(comparisonData);
      addNotification('success', `Successfully compared ${comparisonData.length} weather providers`);
    } catch (err) {
      const errorMsg = handleError(err, {
        context: 'WeatherProviderComparison',
        errorType: ErrorType.API,
      });

      addNotification('error', 'Failed to compare weather providers: ' + errorMsg);
      captureException(err, {
        tags: { context: 'WeatherProviderComparison' },
      });
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="mt-6 sm:mt-8 w-full bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="pb-3 px-4 sm:px-6">
        <h3 className="text-lg font-semibold">Weather Provider Comparison</h3>
        <p className="text-sm text-gray-500">
          Compare weather forecasts from different providers to get a more accurate picture
        </p>
      </div>
      <div className="px-4 sm:px-6 pb-6">
        <div className="space-y-6">
          {providers.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Compare weather data from multiple providers to get a more accurate forecast for your route.
              </p>

              <Button
                onClick={handleCompare}
                disabled={isComparing || !forecastPoints || forecastPoints.length === 0}
                className="w-full py-2.5 sm:py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-full transition-all duration-300 hover:shadow-md active:scale-95 text-sm sm:text-base font-medium"
              >
                {isComparing ? (
                  <>
                    <RefreshCw className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Fetching data...
                  </>
                ) : (
                  'Compare Weather Providers'
                )}
              </Button>

              {(!forecastPoints || forecastPoints.length === 0) && (
                <div className="flex items-center p-4 sm:p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 mr-2 sm:mr-3 flex-shrink-0" />
                  <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">
                    Please upload a GPX file and generate a forecast first
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
                  <TabsTrigger value="details" className="text-sm">Detailed Comparison</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {providers.map(provider => (
                      <div key={provider.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-medium">{provider.name}</h4>
                          {provider.isPremium && (
                            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">Premium</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 sm:p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Thermometer className="h-3.5 w-3.5 text-teal-500" />
                              <p className="text-xs sm:text-sm font-medium">Avg. Temperature</p>
                            </div>
                            <p className="text-base sm:text-lg font-semibold text-teal-600">
                              {(
                                provider.data.reduce(
                                  (sum, data) => sum + (data?.temperature || 0),
                                  0
                                ) / provider.data.length
                              ).toFixed(1)}
                              °C
                            </p>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 sm:p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Droplets className="h-3.5 w-3.5 text-teal-500" />
                              <p className="text-xs sm:text-sm font-medium">Avg. Humidity</p>
                            </div>
                            <p className="text-base sm:text-lg font-semibold text-teal-600">
                              {Math.round(
                                provider.data.reduce((sum, data) => sum + (data?.humidity || 0), 0) /
                                  provider.data.length
                              )}
                              %
                            </p>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 sm:p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Wind className="h-3.5 w-3.5 text-teal-500" />
                              <p className="text-xs sm:text-sm font-medium">Avg. Wind</p>
                            </div>
                            <p className="text-base sm:text-lg font-semibold text-teal-600">
                              {(
                                provider.data.reduce((sum, data) => sum + (data?.windSpeed || 0), 0) /
                                provider.data.length
                              ).toFixed(1)}{' '}
                              m/s
                            </p>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 sm:p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Cloud className="h-3.5 w-3.5 text-teal-500" />
                              <p className="text-xs sm:text-sm font-medium">Max Precipitation</p>
                            </div>
                            <p className="text-base sm:text-lg font-semibold text-teal-600">
                              {Math.max(...provider.data.map(data => data?.rain || 0)).toFixed(1)} mm
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800/60">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          {providers.map(provider => (
                            <th key={provider.id} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {provider.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {(forecastPoints || []).filter((_, i) => i % 3 === 0).map((point, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : ''}>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                              {new Date(point.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            {providers.map(provider => {
                              const data = provider.data[index];
                              return (
                                <td key={provider.id} className="px-4 py-3 whitespace-nowrap text-xs">
                                  {data ? (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1">
                                        <Thermometer className="h-3 w-3 text-teal-500" />
                                        <span>{data.temperature.toFixed(1)}°C</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Wind className="h-3 w-3 text-teal-500" />
                                        <span>{data.windSpeed.toFixed(1)} m/s</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <Skeleton className="h-8 w-16" />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                variant="outline"
                onClick={handleCompare}
                disabled={isComparing}
                className="w-full rounded-full border-teal-500/30 hover:border-teal-500 hover:bg-teal-50 transition-all duration-300 py-2.5 sm:py-3 text-xs sm:text-sm"
              >
                {isComparing ? (
                  <>
                    <RefreshCw className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin text-teal-500" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-teal-500" />
                    Refresh Comparison
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
