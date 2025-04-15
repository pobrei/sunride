'use client';

import React from 'react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">RideWeather Planner</h1>
      <p className="mb-4">Welcome to the RideWeather Planner app!</p>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">App Status</h2>
        <p>The app is currently in maintenance mode due to some technical issues.</p>
        <p className="mt-2">We're working on fixing these issues and will be back soon!</p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">Features</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Upload GPX files</li>
            <li>View weather forecasts for your routes</li>
            <li>Interactive maps and charts</li>
            <li>Export route data as PDF</li>
          </ul>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Improved map performance</li>
            <li>More weather providers</li>
            <li>Route sharing capabilities</li>
            <li>Mobile app</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
