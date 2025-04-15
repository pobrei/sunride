#!/usr/bin/env node

/**
 * This script fixes remaining imports that still use the old @/ path alias.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const frontendDir = path.join(__dirname, '..', 'frontend');
const backendDir = path.join(__dirname, '..', 'backend');
const sharedDir = path.join(__dirname, '..', 'shared');

// Map of file types to process
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// Function to recursively find all files with specific extensions
const findFiles = (dir, extensions) => {
  let results = [];
  
  if (!fs.existsSync(dir)) {
    return results;
  }
  
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search directories
      results = results.concat(findFiles(filePath, extensions));
    } else {
      // Check if file has one of the target extensions
      if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  
  return results;
};

// Function to update imports in a file
const updateImports = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file contains imports using the old @/ path alias
  if (!content.includes('from \'@/')) {
    return;
  }
  
  let updated = false;
  
  // Update imports from @/ to the appropriate new path
  const oldImportRegex = /from\s+['"]@\/([^'"]+)['"]/g;
  const updatedContent = content.replace(oldImportRegex, (match, importPath) => {
    updated = true;
    
    // Determine the appropriate new path alias based on the import path
    if (importPath.startsWith('components/') || 
        importPath.startsWith('app/') || 
        importPath.startsWith('features/') || 
        importPath.startsWith('hooks/') ||
        importPath.startsWith('context/')) {
      return `from '@frontend/${importPath}'`;
    } else if (importPath.startsWith('api/') || 
               importPath.startsWith('lib/mongodb') || 
               importPath.startsWith('lib/weatherAPI') || 
               importPath.startsWith('lib/rateLimiter')) {
      return `from '@backend/${importPath}'`;
    } else if (importPath.startsWith('types/') || 
               importPath.startsWith('utils/') || 
               importPath.startsWith('styles/') ||
               importPath.startsWith('workers/') ||
               importPath.startsWith('lib/utils') || 
               importPath.startsWith('lib/sentry') ||
               importPath.startsWith('lib/gpx')) {
      return `from '@shared/${importPath}'`;
    } else if (importPath.startsWith('lib/')) {
      // For other lib imports, check if they should be backend or shared
      if (fs.existsSync(path.join(backendDir, 'lib', importPath.substring(4)))) {
        return `from '@backend/${importPath}'`;
      } else {
        return `from '@shared/${importPath}'`;
      }
    } else if (importPath === 'types' || importPath.startsWith('types/')) {
      return `from '@shared/types'`;
    } else if (importPath === 'utils' || importPath.startsWith('utils/')) {
      return `from '@shared/utils'`;
    } else if (importPath === 'hooks' || importPath.startsWith('hooks/')) {
      return `from '@frontend/hooks'`;
    }
    
    // If we can't determine the new path, keep the original import
    return match;
  });
  
  if (updated) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated imports in: ${filePath}`);
  }
};

// Main function
const main = () => {
  console.log('Fixing remaining imports...');
  
  // Find all files in the project
  const frontendFiles = findFiles(frontendDir, fileExtensions);
  const backendFiles = findFiles(backendDir, fileExtensions);
  const sharedFiles = findFiles(sharedDir, fileExtensions);
  
  // Update imports in all files
  const allFiles = [...frontendFiles, ...backendFiles, ...sharedFiles];
  let updatedCount = 0;
  
  allFiles.forEach(filePath => {
    const beforeContent = fs.readFileSync(filePath, 'utf8');
    updateImports(filePath);
    const afterContent = fs.readFileSync(filePath, 'utf8');
    
    if (beforeContent !== afterContent) {
      updatedCount++;
    }
  });
  
  console.log(`\nUpdated imports in ${updatedCount} files.`);
  console.log('\nNext steps:');
  console.log('1. Run the development server to make sure everything works correctly');
  console.log('2. Run the tests to see if there are any remaining issues');
  console.log('3. Remove the src directory once you\'re confident the migration was successful');
};

// Run the script
main();
