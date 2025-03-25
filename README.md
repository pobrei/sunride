# RideWeather Planner

A robust and production-ready Next.js application for planning routes with detailed weather forecasts. Upload GPX files, analyze weather conditions along your path, and make informed decisions for your outdoor activities.

![RideWeather Planner screenshot](./public/assets/screenshot.png)

## Features

- **GPX File Parsing**: Upload and parse GPX files to extract route data including coordinates, distance, and elevation profiles.
- **Dynamic Weather Forecasting**: Get detailed weather forecasts at custom intervals along your route.
- **Interactive Map**: Visualize your route with weather markers on an interactive Leaflet map.
- **Detailed Data Visualization**: View weather patterns through interactive charts (temperature, precipitation, wind, humidity, pressure, elevation).
- **Timeline & Alerts**: Scrollable timeline of forecast points and important weather alerts (high wind, extreme heat, freezing temperatures, heavy rain).
- **PDF Export**: Generate comprehensive PDF reports of your route with weather data.
- **Mobile-Responsive Design**: Fully responsive layout that works on all devices.

## Tech Stack

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS and Shadcn UI
- **Maps**: Leaflet.js
- **Charts**: Chart.js
- **Animation**: GSAP
- **PDF Generation**: jsPDF and html2canvas
- **Database**: MongoDB for weather data caching
- **APIs**: OpenWeather API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB connection string
- OpenWeather API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/weatherapp.git
   cd weatherapp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   OPENWEATHER_API_KEY=your_openweather_api_key
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload GPX File**: Click the "Upload" button to select and upload a GPX file from your device.
2. **Configure Settings**:
   - Set the start time for your activity
   - Adjust the weather forecast interval (km)
   - Set your average speed (km/h)
3. **Generate Forecast**: Click "Generate Forecast" to calculate and display weather data.
4. **Explore Data**:
   - View the interactive map with color-coded weather markers
   - Check the timeline for a quick overview
   - View detailed charts for different weather parameters
   - Note any weather alerts that may affect your journey
5. **Export to PDF**: Click "Export PDF" to save a comprehensive report.

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Add the environment variables:
   - `MONGODB_URI`
   - `OPENWEATHER_API_KEY`
4. Deploy.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenWeather API for providing weather data
- GPX file format specifications
- Shadcn UI for the beautiful component library
- Next.js team for the fantastic framework
