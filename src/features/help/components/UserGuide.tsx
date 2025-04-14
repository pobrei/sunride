'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  ChevronRight,
  Upload,
  Map,
  BarChart4,
  Clock,
  AlertTriangle,
  FileDown
} from 'lucide-react';

// Import from components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const UserGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleGuide = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={toggleGuide}
        aria-label={isOpen ? "Close user guide" : "Open user guide"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>RideWeather Planner User Guide</CardTitle>
                <Button variant="ghost" size="icon" onClick={toggleGuide} aria-label="Close guide">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription>
                Learn how to use the RideWeather Planner to plan your routes with weather forecasting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <ChevronRight className="h-5 w-5 mr-2 text-primary" />
                  Getting Started
                </h3>
                <p>
                  RideWeather Planner helps you plan your outdoor activities by showing weather forecasts along your route.
                  Follow these steps to get started:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Upload a GPX file containing your route</li>
                  <li>Configure route settings (speed, start time)</li>
                  <li>Generate the weather forecast</li>
                  <li>Explore the weather data on the map and charts</li>
                </ol>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-primary" />
                  Uploading Your Route
                </h3>
                <p>
                  To upload your route, click the "Upload GPX File" button. You can export GPX files from most mapping
                  and fitness tracking applications like Strava, Komoot, Garmin Connect, or RideWithGPS.
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">Supported file types:</p>
                  <ul className="list-disc list-inside text-sm ml-2">
                    <li>GPX files (.gpx)</li>
                    <li>Maximum file size: 5MB</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Route Settings
                </h3>
                <p>
                  After uploading your route, configure the following settings:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Start Time:</span>
                    <span>When you plan to start your activity. This affects the weather forecast times.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Average Speed:</span>
                    <span>Your estimated average speed. This determines when you'll reach each point on your route.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Weather Interval:</span>
                    <span>How frequently to show weather data points along your route (in kilometers or miles).</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <Map className="h-5 w-5 mr-2 text-primary" />
                  Using the Map
                </h3>
                <p>
                  The interactive map shows your route with color-coded markers indicating weather conditions:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span>Good conditions (clear, partly cloudy)</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                    <span>Moderate conditions (cloudy, light rain)</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                    <span>Challenging conditions (heavy rain, thunderstorms, strong winds)</span>
                  </li>
                </ul>
                <p className="mt-2">
                  Click on any marker to see detailed weather information for that location and time.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <BarChart4 className="h-5 w-5 mr-2 text-primary" />
                  Weather Charts
                </h3>
                <p>
                  The charts section displays weather data along your route:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Temperature:</span>
                    <span>Shows temperature and "feels like" temperature along your route.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Precipitation:</span>
                    <span>Shows rainfall amounts and probability of precipitation.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Wind:</span>
                    <span>Shows wind speed and gusts along your route.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Other charts:</span>
                    <span>Humidity, pressure, and elevation profiles are also available.</span>
                  </li>
                </ul>
                <p className="mt-2">
                  Click on any point in the charts to highlight the corresponding location on the map.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                  Weather Alerts
                </h3>
                <p>
                  The app automatically identifies potential weather concerns along your route:
                </p>
                <ul className="space-y-2">
                  <li>Heavy rainfall or thunderstorms</li>
                  <li>Strong winds</li>
                  <li>Extreme temperatures</li>
                  <li>Rapid weather changes</li>
                </ul>
                <p className="mt-2">
                  These alerts help you identify sections of your route that might require extra preparation or consideration.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileDown className="h-5 w-5 mr-2 text-primary" />
                  Exporting Your Plan
                </h3>
                <p>
                  You can export your route with weather data as a PDF report by clicking the "Export as PDF" button.
                  The report includes:
                </p>
                <ul className="space-y-2">
                  <li>Route map with weather markers</li>
                  <li>Weather charts</li>
                  <li>Detailed forecast for each point</li>
                  <li>Summary of weather alerts</li>
                </ul>
              </section>

              <section className="space-y-3 border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold">Tips for Best Results</h3>
                <ul className="space-y-2">
                  <li>Weather forecasts are most accurate for the next 48 hours</li>
                  <li>For multi-day activities, consider generating separate forecasts for each day</li>
                  <li>Check for updated forecasts closer to your start time</li>
                  <li>Use the weather interval setting to balance detail vs. clarity</li>
                </ul>
              </section>

              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>Weather data provided by OpenWeather API</p>
                <p>RideWeather Planner &copy; {typeof window !== 'undefined' ? new Date().getFullYear() : 2024}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default UserGuide;
