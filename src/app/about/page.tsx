'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Github, Globe, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <PageWrapper>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">About RideWeather</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>About the Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              RideWeather is a web application designed to help cyclists, hikers, and outdoor enthusiasts plan their routes with detailed weather forecasts along the way.
            </p>
            <p>
              Upload your GPX route file and get a comprehensive weather forecast for each point along your journey, including temperature, precipitation, wind speed, humidity, pressure, and UV index.
            </p>
            <p>
              This project was built with Next.js, TypeScript, Tailwind CSS, and various other modern web technologies.
            </p>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/yourusername/rideweather" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Repository
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Project Website
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              <li>Upload and parse GPX route files</li>
              <li>Visualize routes on an interactive map</li>
              <li>Get detailed weather forecasts along your route</li>
              <li>View temperature, precipitation, wind, humidity, pressure, and UV index data</li>
              <li>Interactive timeline for navigating through your route</li>
              <li>Detailed charts for visualizing weather patterns</li>
              <li>Weather alerts for potentially hazardous conditions</li>
              <li>Route summary with key statistics</li>
              <li>Dark mode support</li>
              <li>Responsive design for all devices</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 list-decimal pl-5">
              <li>
                <strong>Upload a GPX File:</strong> Start by uploading a GPX file containing your planned route. You can export GPX files from popular apps like Strava, Komoot, or RideWithGPS.
              </li>
              <li>
                <strong>View Your Route:</strong> Once uploaded, your route will be displayed on the interactive map with markers for each forecast point.
              </li>
              <li>
                <strong>Explore Weather Data:</strong> Use the timeline to navigate through your route and see the weather forecast for each point. Click on markers on the map to see detailed weather information.
              </li>
              <li>
                <strong>Check Weather Charts:</strong> View detailed charts for temperature, precipitation, wind, humidity, pressure, and UV index along your route.
              </li>
              <li>
                <strong>Review Weather Alerts:</strong> Pay attention to any weather alerts that might affect your journey, such as high winds, heavy rain, or extreme temperatures.
              </li>
              <li>
                <strong>Plan Accordingly:</strong> Use the information provided to plan your trip, including what to wear, when to start, and potential rest stops.
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Have questions, feedback, or suggestions? Feel free to reach out!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" asChild>
                <a href="mailto:contact@example.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Us
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://github.com/yourusername/rideweather/issues" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  Report an Issue
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
