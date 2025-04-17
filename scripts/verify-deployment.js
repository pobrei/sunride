#!/usr/bin/env node

/**
 * This script verifies that the local environment is ready for deployment
 * and matches what will be deployed to Vercel.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(`${colors.cyan}=== SunRide Deployment Verification ====${colors.reset}\n`);

// Check if Git is clean
try {
  console.log(`${colors.blue}Checking Git status...${colors.reset}`);
  const gitStatus = execSync('git status --porcelain').toString();
  
  if (gitStatus.trim() !== '') {
    console.log(`${colors.red}❌ Git working directory is not clean. Please commit or stash changes before deploying.${colors.reset}`);
    console.log(`${colors.yellow}Uncommitted changes:${colors.reset}`);
    console.log(gitStatus);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ Git working directory is clean.${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}❌ Error checking Git status: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Check if .env.local exists
console.log(`${colors.blue}Checking environment variables...${colors.reset}`);
if (!fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  console.log(`${colors.red}❌ .env.local file not found. Please create it before deploying.${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.green}✅ .env.local file exists.${colors.reset}`);
  
  // Check for required environment variables
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
  const requiredVars = ['OPENWEATHER_API_KEY'];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(`${varName}=`));
  
  if (missingVars.length > 0) {
    console.log(`${colors.red}❌ Missing required environment variables: ${missingVars.join(', ')}${colors.reset}`);
    console.log(`${colors.yellow}Please add them to .env.local and make sure they are set in Vercel.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ All required environment variables are set.${colors.reset}`);
  }
}

// Check if vercel.json exists
console.log(`${colors.blue}Checking Vercel configuration...${colors.reset}`);
if (!fs.existsSync(path.join(process.cwd(), 'vercel.json'))) {
  console.log(`${colors.red}❌ vercel.json file not found. Please create it before deploying.${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.green}✅ vercel.json file exists.${colors.reset}`);
}

// Check if next.config.js exists
console.log(`${colors.blue}Checking Next.js configuration...${colors.reset}`);
if (!fs.existsSync(path.join(process.cwd(), 'next.config.js'))) {
  console.log(`${colors.red}❌ next.config.js file not found. Please create it before deploying.${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.green}✅ next.config.js file exists.${colors.reset}`);
}

// Run a production build to make sure it works
console.log(`${colors.blue}Running a production build...${colors.reset}`);
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}✅ Production build successful.${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}❌ Production build failed. Please fix the errors before deploying.${colors.reset}`);
  process.exit(1);
}

// Run tests to make sure they pass
console.log(`${colors.blue}Running tests...${colors.reset}`);
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log(`${colors.green}✅ Tests passed.${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}❌ Tests failed. Please fix the failing tests before deploying.${colors.reset}`);
  process.exit(1);
}

console.log(`\n${colors.green}✅ All checks passed! Your local environment is ready for deployment.${colors.reset}`);
console.log(`${colors.cyan}To deploy to Vercel, make sure you have set up the same environment variables in the Vercel dashboard.${colors.reset}`);
console.log(`${colors.cyan}Then run: git push origin main${colors.reset}`);
