# Deploying to Vercel

This document outlines the steps to deploy the Weather App to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository with your code (GitHub, GitLab, or Bitbucket)
- MongoDB Atlas account with a configured cluster
- OpenWeather API key

## Environment Variables

The app requires the following environment variables to be set in Vercel:

- `MONGODB_URI`: Your MongoDB connection string
- `OPENWEATHER_API_KEY`: Your OpenWeather API key

## Deployment Steps

1. Push your code to a Git repository if you haven't already.

2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click "New Project".

3. Import your Git repository.

4. Configure project:

   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: Vercel will automatically detect this
   - Output Directory: .next (already configured)

5. Add environment variables:

   - Click "Environment Variables" and add the required variables mentioned above.
   - Ensure they are set for Production, Preview, and Development environments.

6. Click "Deploy" and wait for the deployment to complete.

7. Once deployed, Vercel will provide you with a URL to access your application.

## Troubleshooting

If you encounter issues during deployment, check the following:

1. Verify that all environment variables are correctly set in Vercel.
2. Check the build logs for any errors.
3. Make sure your MongoDB Atlas cluster has network access configured to allow connections from Vercel's IP ranges (or set it to allow access from anywhere).
4. Ensure your OpenWeather API key is valid and has the necessary permissions.

## Continuous Deployment

Vercel automatically sets up continuous deployment from your Git repository. Any new commits to the main branch will trigger a new deployment.

If you want to change this behavior, you can configure deployment settings in your project settings on Vercel.
