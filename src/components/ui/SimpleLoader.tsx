'use client';

import React from 'react';
import '@/styles/custom-loader.css';

/**
 * A simple loader component that uses the exact CSS class provided
 */
export function SimpleLoader() {
  return (
    <div className="flex flex-col items-center justify-center">
      <span className="loader"></span>
    </div>
  );
}
