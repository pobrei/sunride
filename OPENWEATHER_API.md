# Setting Up OpenWeather API

This application uses the OpenWeather API to fetch real weather data. Follow these steps to set up your API key:

## Getting an OpenWeather API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/) and sign up for a free account
2. After signing up and verifying your email, go to your account page
3. Navigate to the "API Keys" tab
4. Copy your API key (or generate a new one if needed)

## Adding the API Key to Your Project

1. Open the `.env.local` file in the root of your project
2. Replace the placeholder value with your actual API key:

```
OPENWEATHER_API_KEY=your_actual_api_key_here
```

3. Save the file and restart your development server

## Important Notes

- The free tier of OpenWeather API allows up to 1,000 API calls per day
- It may take a few hours after signing up for your API key to become active
- If you see "No weather data available" messages, check that your API key is correct and active
- The application will fall back to mock data if no valid API key is provided

## Troubleshooting

If you're experiencing issues with the weather data:

1. Verify your API key is correct in `.env.local`
2. Check the browser console for any error messages
3. Make sure your API key has been activated (can take up to 2 hours after registration)
4. Try accessing the OpenWeather API directly to test your key:
   ```
   https://api.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=YOUR_API_KEY
   ```
5. If you're still having issues, the application will use mock data as a fallback
