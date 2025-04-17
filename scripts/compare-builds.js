#!/usr/bin/env node

/**
 * This script compares the local build fingerprint with the one from Vercel
 * to ensure they match.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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

console.log(`${colors.cyan}=== SunRide Build Comparison ====${colors.reset}\n`);

// Check if local build fingerprint exists
const localFingerprintPath = path.join(process.cwd(), 'build-fingerprint.json');
if (!fs.existsSync(localFingerprintPath)) {
  console.error(`${colors.red}❌ Local build fingerprint not found. Run 'npm run verify:deployment' first.${colors.reset}`);
  process.exit(1);
}

// Read local build fingerprint
const localFingerprint = JSON.parse(fs.readFileSync(localFingerprintPath, 'utf8'));
console.log(`${colors.green}✅ Local build fingerprint: ${localFingerprint.hash}${colors.reset}`);
console.log(`${colors.green}✅ Local file count: ${localFingerprint.fileCount}${colors.reset}`);
console.log(`${colors.green}✅ Local build timestamp: ${localFingerprint.timestamp}${colors.reset}`);
console.log(`${colors.green}✅ Local git commit: ${localFingerprint.gitCommit}${colors.reset}`);
console.log(`${colors.green}✅ Local git branch: ${localFingerprint.gitBranch}${colors.reset}\n`);

// Get Vercel URL from command line argument
if (process.argv.length < 3) {
  console.error(`${colors.red}❌ Please provide the Vercel URL as an argument.${colors.reset}`);
  console.log(`${colors.yellow}Usage: node scripts/compare-builds.js https://your-vercel-url${colors.reset}`);
  process.exit(1);
}

const vercelUrl = process.argv[2].replace(/\/$/, ''); // Remove trailing slash if present

console.log(`${colors.blue}Fetching build fingerprint from ${vercelUrl}/build-fingerprint.json...${colors.reset}`);

// Fetch Vercel build fingerprint
https.get(`${vercelUrl}/build-fingerprint.json`, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`${colors.red}❌ Failed to fetch Vercel build fingerprint. Status code: ${res.statusCode}${colors.reset}`);
      console.error(`${colors.yellow}Make sure the URL is correct and the build-fingerprint.json file is accessible.${colors.reset}`);
      process.exit(1);
    }
    
    try {
      const vercelFingerprint = JSON.parse(data);
      console.log(`${colors.green}✅ Vercel build fingerprint: ${vercelFingerprint.hash}${colors.reset}`);
      console.log(`${colors.green}✅ Vercel file count: ${vercelFingerprint.fileCount}${colors.reset}`);
      console.log(`${colors.green}✅ Vercel build timestamp: ${vercelFingerprint.timestamp}${colors.reset}`);
      console.log(`${colors.green}✅ Vercel environment: ${JSON.stringify(vercelFingerprint.environment)}${colors.reset}`);
      
      if (vercelFingerprint.gitCommit) {
        console.log(`${colors.green}✅ Vercel git commit: ${vercelFingerprint.gitCommit}${colors.reset}`);
      }
      
      if (vercelFingerprint.gitBranch) {
        console.log(`${colors.green}✅ Vercel git branch: ${vercelFingerprint.gitBranch}${colors.reset}`);
      }
      
      console.log('\n=== Comparison Results ===');
      
      // Compare fingerprints
      if (localFingerprint.hash === vercelFingerprint.hash) {
        console.log(`${colors.green}✅ MATCH: Build fingerprints are identical!${colors.reset}`);
        console.log(`${colors.green}✅ Your local build matches exactly what's deployed on Vercel.${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ MISMATCH: Build fingerprints are different!${colors.reset}`);
        console.log(`${colors.yellow}This means your local build is different from what's deployed on Vercel.${colors.reset}`);
        console.log(`${colors.yellow}Possible reasons:${colors.reset}`);
        console.log(`${colors.yellow}1. Different environment variables${colors.reset}`);
        console.log(`${colors.yellow}2. Different Node.js versions${colors.reset}`);
        console.log(`${colors.yellow}3. Different npm/yarn versions${colors.reset}`);
        console.log(`${colors.yellow}4. Different build commands or configurations${colors.reset}`);
        console.log(`${colors.yellow}5. Files modified after the build${colors.reset}`);
      }
      
      // Compare file counts
      if (localFingerprint.fileCount === vercelFingerprint.fileCount) {
        console.log(`${colors.green}✅ MATCH: File counts are identical (${localFingerprint.fileCount} files)${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ MISMATCH: File counts are different!${colors.reset}`);
        console.log(`${colors.yellow}Local: ${localFingerprint.fileCount} files${colors.reset}`);
        console.log(`${colors.yellow}Vercel: ${vercelFingerprint.fileCount} files${colors.reset}`);
      }
      
      // Compare git commits
      if (localFingerprint.gitCommit && vercelFingerprint.gitCommit) {
        if (localFingerprint.gitCommit === vercelFingerprint.gitCommit) {
          console.log(`${colors.green}✅ MATCH: Git commits are identical${colors.reset}`);
        } else {
          console.log(`${colors.red}❌ MISMATCH: Git commits are different!${colors.reset}`);
          console.log(`${colors.yellow}Local: ${localFingerprint.gitCommit}${colors.reset}`);
          console.log(`${colors.yellow}Vercel: ${vercelFingerprint.gitCommit}${colors.reset}`);
        }
      }
    } catch (error) {
      console.error(`${colors.red}❌ Error parsing Vercel build fingerprint: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error(`${colors.red}❌ Error fetching Vercel build fingerprint: ${error.message}${colors.reset}`);
  process.exit(1);
});
