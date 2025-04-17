#!/usr/bin/env node

/**
 * This script generates a build fingerprint on Vercel
 * It should be run as part of the Vercel build process
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

console.log('=== SunRide Vercel Build Verification ====\n');

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
  
  // Get environment information
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    VERCEL: process.env.VERCEL || 'false',
    VERCEL_ENV: process.env.VERCEL_ENV || 'unknown',
    VERCEL_REGION: process.env.VERCEL_REGION || 'unknown',
    VERCEL_URL: process.env.VERCEL_URL || 'unknown'
  };
  
  // Get git information if available
  let gitInfo = {};
  try {
    gitInfo = {
      gitCommit: execSync('git rev-parse HEAD').toString().trim(),
      gitBranch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
    };
  } catch (e) {
    gitInfo = {
      gitCommit: 'unavailable',
      gitBranch: 'unavailable'
    };
  }
  
  // Save the fingerprint to a file that will be accessible in the deployment
  const fingerprintData = {
    hash: buildFingerprint.hash,
    fileCount: buildFingerprint.fileCount,
    timestamp: new Date().toISOString(),
    environment: envInfo,
    ...gitInfo
  };
  
  // Write to public directory so it's accessible via the web
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(publicDir, 'build-fingerprint.json'),
    JSON.stringify(fingerprintData, null, 2)
  );
  
  // Also write to the root for reference
  fs.writeFileSync(
    path.join(process.cwd(), 'build-fingerprint.json'),
    JSON.stringify(fingerprintData, null, 2)
  );
  
  console.log(`✅ Build fingerprint generated: ${buildFingerprint.hash}`);
  console.log(`✅ Processed ${buildFingerprint.fileCount} files`);
  console.log(`✅ Fingerprint saved to public/build-fingerprint.json`);
  console.log(`✅ This file will be accessible at: https://[your-vercel-url]/build-fingerprint.json`);
} catch (error) {
  console.error(`❌ Error generating build fingerprint: ${error.message}`);
  // Don't exit with error to allow the build to continue
}
