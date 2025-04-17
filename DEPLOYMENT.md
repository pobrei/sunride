# Deploying SunRide to Vercel

This document outlines the steps to deploy the SunRide app to Vercel and ensure that the deployed version matches what you test locally.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository with your code (GitHub, GitLab, or Bitbucket)
- MongoDB Atlas account with a configured cluster
- OpenWeather API key

## Environment Variables

The app requires the following environment variables to be set in Vercel:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENWEATHER_API_KEY` | API key for OpenWeather | Yes |
| `MONGODB_URI` | Connection string for MongoDB | Yes |
| `NODE_ENV` | Set to "production" for deployment | Yes |
| `DEBUG` | Set to "false" for deployment | No |
| `RATE_LIMIT_MAX` | Maximum number of requests per minute | No |
| `RATE_LIMIT_WINDOW` | Time window for rate limiting in ms | No |
| `CACHE_DURATION` | Cache duration in ms | No |

## Pre-Deployment Checklist

Before deploying to Vercel, make sure:

1. ✅ All changes are committed to Git
2. ✅ All tests pass locally
3. ✅ The application builds successfully in production mode
4. ✅ All required environment variables are set both locally and on Vercel

## Deployment Steps

### 1. Verify Local Environment

Run the verification script to ensure your local environment is ready for deployment:

```bash
node scripts/verify-deployment.js
```

### 2. Set Environment Variables in Vercel

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Add all the required environment variables from your `.env.local` file

### 3. Deploy to Vercel

Vercel is configured to automatically deploy when changes are pushed to the `main` branch:

```bash
git push origin main
```

### 4. Verify Deployment

After deployment, verify that:

1. The application is running correctly on Vercel
2. All features work as expected
3. There are no console errors
4. The UI matches what you tested locally

### 5. Verify Build Consistency

To ensure the deployed version is identical to your local build:

```bash
# First, run the local verification to generate a build fingerprint
npm run verify:deployment

# Then compare with the Vercel deployment
npm run compare:builds https://your-vercel-url
```

If the builds match, you'll see a confirmation message. If they don't match, the script will provide possible reasons for the discrepancy.

## Troubleshooting

If the deployed version differs from your local version, check:

1. **Environment Variables**: Make sure all environment variables are set correctly in Vercel
2. **Build Settings**: Check the build settings in Vercel match your local configuration
3. **Dependencies**: Ensure all dependencies are installed correctly
4. **Cache**: Try clearing the Vercel build cache and redeploying
5. **MongoDB Access**: Make sure your MongoDB Atlas cluster has network access configured to allow connections from Vercel's IP ranges (or set it to allow access from anywhere)
6. **API Keys**: Ensure your OpenWeather API key is valid and has the necessary permissions

## Continuous Deployment

Vercel automatically sets up continuous deployment from your Git repository. Any new commits to the main branch will trigger a new deployment.

If you want to change this behavior, you can configure deployment settings in your project settings on Vercel.

## Rollback Procedure

If you need to rollback to a previous version:

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Deployments"
4. Find the previous working deployment
5. Click "..." > "Promote to Production"
