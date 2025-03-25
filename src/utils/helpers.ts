import { WeatherData } from '@/lib/weatherAPI';

// Format distance
export function formatDistance(distance: number): string {
  return distance < 1 
    ? `${Math.round(distance * 1000)} m` 
    : `${distance.toFixed(1)} km`;
}

// Format elevation
export function formatElevation(elevation: number): string {
  return `${Math.round(elevation)} m`;
}

// Format date and time
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString([], { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  });
}

// Format time only
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
}

// Format temperature
export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`;
}

// Format wind with direction and speed
export function formatWind(speed: number, direction: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const ix = Math.floor((direction + 22.5) / 45) % 8;
  return `${speed.toFixed(1)} m/s ${dirs[ix]}`;
}

// Format precipitation
export function formatPrecipitation(precip: number): string {
  return precip < 0.1 ? 'None' : `${precip.toFixed(1)} mm`;
}

// Check if weather conditions are potentially dangerous
export function checkWeatherAlerts(weather: WeatherData): {
  highWind: boolean;
  extremeHeat: boolean;
  freezing: boolean;
  heavyRain: boolean;
} {
  return {
    highWind: weather.windSpeed > 10,
    extremeHeat: weather.temperature > 35,
    freezing: weather.temperature < 0,
    heavyRain: weather.rain > 5
  };
}

// Get weather icon URL
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Get the appropriate marker color based on weather conditions
export function getMarkerColor(weather: WeatherData): string {
  const alerts = checkWeatherAlerts(weather);
  
  if (alerts.extremeHeat) return '#FF5722'; // Red-orange for extreme heat
  if (alerts.freezing) return '#2196F3';    // Blue for freezing
  if (alerts.highWind) return '#FFC107';    // Amber for high wind
  if (alerts.heavyRain) return '#673AB7';   // Deep purple for heavy rain
  
  // Default - normal conditions
  return '#4CAF50'; // Green
}

// Helper for chart gradients
export function createTemperatureGradient(
  ctx: CanvasRenderingContext2D, 
  minTemp: number, 
  maxTemp: number
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  
  if (minTemp < 0 && maxTemp > 30) {
    // Wide range: cold to hot
    gradient.addColorStop(0, 'rgba(255, 87, 34, 0.8)');  // Hot (red-orange)
    gradient.addColorStop(0.4, 'rgba(76, 175, 80, 0.5)'); // Pleasant (green)
    gradient.addColorStop(1, 'rgba(33, 150, 243, 0.8)');  // Cold (blue)
  } else if (minTemp < 0) {
    // Cold range
    gradient.addColorStop(0, 'rgba(33, 150, 243, 0.5)');
    gradient.addColorStop(1, 'rgba(33, 150, 243, 0.8)');
  } else if (maxTemp > 30) {
    // Hot range
    gradient.addColorStop(0, 'rgba(255, 87, 34, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 152, 0, 0.5)');
  } else {
    // Pleasant range
    gradient.addColorStop(0, 'rgba(76, 175, 80, 0.5)');
    gradient.addColorStop(1, 'rgba(76, 175, 80, 0.8)');
  }
  
  return gradient;
} 