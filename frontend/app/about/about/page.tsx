'use client';

import React from 'react';
import { PageWrapper } from '@frontend/components/layout/page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { Button } from '@frontend/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Github, Globe, Mail } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { typography, animation, effects, layout } from '@shared/styles/tailwind-utils';

export default function AboutPage() {
  return (
    <PageWrapper>
      <div className={cn(layout.flexRow, "gap-2 mb-6", animation.fadeIn)}>
        <Button variant="outline" size="sm" asChild className={effects.buttonHover}>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className={cn(typography.h2)}>About RideWeather</h1>
      </div>

      <div className={cn(layout.gridSm, "gap-6", animation.fadeIn)}>
        <Card className={effects.cardHoverable}>
          <CardHeader>
            <CardTitle className={typography.cardTitle}>About the Project</CardTitle>
          </CardHeader>
          <CardContent className={cn("space-y-4")}>
            <p className={typography.body}>
              RideWeather is a web application designed to help cyclists, hikers, and outdoor
              enthusiasts plan their routes with detailed weather forecasts along the way.
            </p>
            <p className={typography.body}>
              Upload your GPX route file and get a comprehensive weather forecast for each point
              along your journey, including temperature, precipitation, wind speed, humidity,
              pressure, and UV index.
            </p>
            <p className={typography.body}>
              This project was built with Next.js, TypeScript, Tailwind CSS, and various other
              modern web technologies.
            </p>
            <div className={cn(layout.flexRow, "gap-4 pt-4")}>
              <Button variant="outline" size="sm" asChild className={effects.buttonHover}>
                <a
                  href="https://github.com/yourusername/rideweather"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Repository
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild className={effects.buttonHover}>
                <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Project Website
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={effects.cardHoverable}>
          <CardHeader>
            <CardTitle className={typography.cardTitle}>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={cn("space-y-2 list-disc pl-5", typography.body)}>
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

        <Card className={cn("md:col-span-2", effects.cardHoverable)}>
          <CardHeader>
            <CardTitle className={typography.cardTitle}>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className={cn("space-y-4 list-decimal pl-5", typography.body)}>
              <li>
                <strong className={typography.strong}>Upload a GPX File:</strong> Start by uploading a GPX file containing your
                planned route. You can export GPX files from popular apps like Strava, Komoot, or
                RideWithGPS.
              </li>
              <li>
                <strong className={typography.strong}>View Your Route:</strong> Once uploaded, your route will be displayed on the
                interactive map with markers for each forecast point.
              </li>
              <li>
                <strong className={typography.strong}>Explore Weather Data:</strong> Use the timeline to navigate through your
                route and see the weather forecast for each point. Click on markers on the map to
                see detailed weather information.
              </li>
              <li>
                <strong className={typography.strong}>Check Weather Charts:</strong> View detailed charts for temperature,
                precipitation, wind, humidity, pressure, and UV index along your route.
              </li>
              <li>
                <strong className={typography.strong}>Review Weather Alerts:</strong> Pay attention to any weather alerts that
                might affect your journey, such as high winds, heavy rain, or extreme temperatures.
              </li>
              <li>
                <strong className={typography.strong}>Plan Accordingly:</strong> Use the information provided to plan your trip,
                including what to wear, when to start, and potential rest stops.
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card className={cn("md:col-span-2", effects.cardHoverable)}>
          <CardHeader>
            <CardTitle className={typography.cardTitle}>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(typography.body, "mb-4")}>
              Have questions, feedback, or suggestions? Feel free to reach out!
            </p>
            <div className={cn("flex flex-col sm:flex-row gap-4", animation.fadeIn)}>
              <Button variant="outline" asChild className={effects.buttonHover}>
                <a href="mailto:contact@example.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Us
                </a>
              </Button>
              <Button variant="outline" asChild className={effects.buttonHover}>
                <a
                  href="https://github.com/yourusername/rideweather/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
