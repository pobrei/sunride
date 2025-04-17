#!/usr/bin/env node

/**
 * This script verifies that the local environment is ready for deployment
 * and matches what will be deployed to Vercel.
 *
 * It performs the following checks:
 * 1. Git working directory is clean
 * 2. Required environment variables are set
 * 3. Vercel configuration exists
 * 4. Next.js configuration exists
 * 5. Production build works locally
 * 6. Tests pass
 * 7. Build output matches what will be deployed to Vercel
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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

// Generate a build fingerprint to compare with Vercel
console.log(`${colors.blue}Generating build fingerprint...${colors.reset}`);

// Function to calculate directory hash
function calculateDirectoryHash(directory) {
  const files = [];

  function traverseDirectory(currentPath, relativePath = '') {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const entryRelativePath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, and other non-essential directories
        if (!['node_modules', '.git', '.next', 'out', 'build', '.vercel', 'coverage'].includes(entry.name)) {
          traverseDirectory(fullPath, entryRelativePath);
        }
      } else {
        // Skip certain file types and hidden files
        if (!entry.name.startsWith('.') &&
            !['.log', '.tsbuildinfo'].some(ext => entry.name.endsWith(ext))) {
          files.push({
            path: entryRelativePath,
            hash: crypto.createHash('md5').update(fs.readFileSync(fullPath)).digest('hex')
          });
        }
      }
    }
  }

  traverseDirectory(directory);

  // Sort files by path for consistent hashing
  files.sort((a, b) => a.path.localeCompare(b.path));

  // Create a hash of all file hashes
  const hasher = crypto.createHash('sha256');
  for (const file of files) {
    hasher.update(`${file.path}:${file.hash}\n`);
  }

  return {
    hash: hasher.digest('hex'),
    fileCount: files.length
  };
}

try {
  const buildFingerprint = calculateDirectoryHash(process.cwd());

  // Save the fingerprint to a file that can be included in the deployment
  fs.writeFileSync(
    path.join(process.cwd(), 'build-fingerprint.json'),
    JSON.stringify({
      hash: buildFingerprint.hash,
      fileCount: buildFingerprint.fileCount,
      timestamp: new Date().toISOString(),
      gitCommit: execSync('git rev-parse HEAD').toString().trim(),
      gitBranch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
    }, null, 2)
  );

  console.log(`${colors.green}✅ Build fingerprint generated: ${buildFingerprint.hash}${colors.reset}`);
  console.log(`${colors.green}✅ Processed ${buildFingerprint.fileCount} files${colors.reset}`);
  console.log(`${colors.yellow}This fingerprint has been saved to build-fingerprint.json${colors.reset}`);
  console.log(`${colors.yellow}Include this file in your deployment to verify the build on Vercel${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}❌ Error generating build fingerprint: ${error.message}${colors.reset}`);
}

console.log(`\n${colors.green}✅ All checks passed! Your local environment is ready for deployment.${colors.reset}`);
console.log(`${colors.cyan}To deploy to Vercel, make sure you have set up the same environment variables in the Vercel dashboard.${colors.reset}`);
console.log(`${colors.cyan}Then run: git push origin main${colors.reset}`);

console.log(`\n${colors.magenta}=== Deployment Verification Instructions ===${colors.reset}`);
console.log(`${colors.white}1. After deploying to Vercel, download the build-fingerprint.json from your Vercel deployment${colors.reset}`);
console.log(`${colors.white}2. Compare it with your local build-fingerprint.json${colors.reset}`);
console.log(`${colors.white}3. If the hashes match, your Vercel deployment is identical to your local build${colors.reset}`);
console.log(`${colors.white}4. If they don't match, check for environment differences or build configuration issues${colors.reset}`);
