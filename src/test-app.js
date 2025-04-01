import React, { useState } from 'react';
import { GPXProcessor } from './lib/gpxProcessor';
import { WeatherService } from './lib/weatherProviders';
import ErrorBoundary from './components/ErrorBoundary';
import DOMPurify from 'dompurify';

// Simple test component to verify our improvements
function TestApp() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testGPXProcessing = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test GPX processor
      const processor = new GPXProcessor();
      
      // Sample GPX points
      const testPoints = [
        { lat: 37.7749, lon: -122.4194, ele: 10 },
        { lat: 37.7850, lon: -122.4100, ele: 20 },
        { lat: 37.7950, lon: -122.4000, ele: 15 },
        { lat: 37.8050, lon: -122.3900, ele: 30 }
      ];
      
      // Process GPX data using worker (if available)
      const processingResult = await processor.processGPXData(testPoints, { 
        forecastInterval: 2,
        averageSpeed: 15
      });
      
      // Test weather service (only if API keys are provided)
      let weatherResult = "Weather service test skipped - no API keys provided";
      
      if (process.env.OPENWEATHER_API_KEY) {
        const weatherService = new WeatherService(process.env.OPENWEATHER_API_KEY);
        const weatherData = await weatherService.getWeather(
          testPoints[0].lat, 
          testPoints[0].lon,
          new Date()
        );
        weatherResult = "Weather service test passed: " + JSON.stringify(weatherData);
      }
      
      // Test sanitization
      const unsafeInput = '<script>alert("XSS")</script>Test Location';
      const sanitizedInput = DOMPurify.sanitize(unsafeInput);
      
      setResults({
        gpxProcessing: processingResult,
        sanitization: {
          before: unsafeInput,
          after: sanitizedInput
        },
        weatherService: weatherResult
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>RideWeather Planner Test Suite</h1>
        
        <button 
          onClick={testGPXProcessing}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          aria-label="Run tests"
        >
          {loading ? 'Testing...' : 'Run Tests'}
        </button>
        
        {error && (
          <div 
            style={{ margin: '20px 0', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}
            role="alert"
          >
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {results && (
          <div style={{ margin: '20px 0' }}>
            <h2>Test Results</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>GPX Processing</h3>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                {JSON.stringify(results.gpxProcessing, null, 2)}
              </pre>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>Security Sanitization</h3>
              <p><strong>Before:</strong> {results.sanitization.before}</p>
              <p><strong>After:</strong> {results.sanitization.after}</p>
            </div>
            
            <div>
              <h3>Weather Service</h3>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                {results.weatherService}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default TestApp;
