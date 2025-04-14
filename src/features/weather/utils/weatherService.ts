import { z } from 'zod';

// Weather data validation schema
export const weatherSchema = z.object({
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  windSpeed: z.number().min(0),
  precipitation: z.number().min(0),
  pressure: z.number().min(800).max(1200), // Realistic pressure range in hPa
  clouds: z.number().min(0).max(100),
  time: z.string().datetime(),
  timezone: z.string().optional()
});

export type WeatherData = z.infer<typeof weatherSchema>;

/**
 * Validates weather data against schema
 * @param data Raw weather data to validate
 * @returns Validated and typed weather data
 * @throws Error if validation fails
 */
export const validateWeatherData = (data: unknown): WeatherData => {
  try {
    return weatherSchema.parse(data);
  } catch (error) {
    console.error('Weather data validation failed:', error);
    throw new Error('Invalid weather data format');
  }
};

/**
 * Adjusts weather data based on timezone differences
 * @param data Weather data with timestamps
 * @param routeTimezone Timezone of the route
 * @returns Weather data with synchronized timestamps
 */
export const synchronizeTimeZones = (data: WeatherData, routeTimezone: string): WeatherData => {
  if (!data.timezone || data.timezone === routeTimezone) {
    return data;
  }
  
  // Convert timestamps between timezones
  const timeUTC = new Date(data.time);
  const options = { timeZone: routeTimezone };
  const adjustedTime = timeUTC.toLocaleString('en-US', options);
  
  return {
    ...data,
    time: new Date(adjustedTime).toISOString(),
    timezone: routeTimezone
  };
};
