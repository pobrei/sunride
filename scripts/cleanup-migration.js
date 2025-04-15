#!/usr/bin/env node

/**
 * This script cleans up the project after the migration to the modular structure.
 * It removes the src directory and any temporary files created during the migration.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const srcDir = path.join(__dirname, '..', 'src');

// Function to remove a directory recursively
const removeDirectory = (dir) => {
  if (fs.existsSync(dir)) {
    console.log(`Removing directory: ${dir}`);
    execSync(`rm -rf "${dir}"`);
  }
};

// Main function
const main = () => {
  console.log('Cleaning up after migration...');
  
  // Ask for confirmation before removing the src directory
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Are you sure you want to remove the src directory? This action cannot be undone. (y/n) ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      // Remove the src directory
      removeDirectory(srcDir);
      
      console.log('\nCleanup completed!');
      console.log('\nThe migration to the modular structure is now complete.');
      console.log('The project is now organized into three main folders:');
      console.log('- frontend/ - Contains the Next.js app, UI components, and client-side logic');
      console.log('- backend/ - Contains API routes, server-side logic, and database connections');
      console.log('- shared/ - Contains utilities, types, and constants used by both frontend and backend');
    } else {
      console.log('\nCleanup aborted. The src directory was not removed.');
    }
    
    readline.close();
  });
};

// Run the script
main();
