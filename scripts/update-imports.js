#!/usr/bin/env node

/**
 * This script updates import statements in the migrated files to use the new path aliases.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const frontendDir = path.join(__dirname, '..', 'frontend');
const backendDir = path.join(__dirname, '..', 'backend');
const sharedDir = path.join(__dirname, '..', 'shared');

// Map of file types to process
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// Function to recursively find all files with specific extensions
const findFiles = (dir, extensions) => {
  let results = [];
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
  let updated = false;

  // Determine which folder the file is in
  const isInFrontend = filePath.startsWith(frontendDir);
  const isInBackend = filePath.startsWith(backendDir);
  const isInShared = filePath.startsWith(sharedDir);

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
               importPath.startsWith('lib/rateLimiter') ||
               importPath.startsWith('middleware')) {
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
    }

    // If we can't determine the new path, keep the original import
    return match;
  });

  // Update relative imports if needed
  // This is more complex and would require knowledge of the file structure
  // For now, we'll focus on the @/ imports

  if (updated) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated imports in: ${filePath}`);
  }
};

// Main function
const main = () => {
  console.log('Updating imports in migrated files...');

  // Find all TypeScript/JavaScript files in the migrated folders
  const frontendFiles = findFiles(frontendDir, fileExtensions);
  const backendFiles = findFiles(backendDir, fileExtensions);
  const sharedFiles = findFiles(sharedDir, fileExtensions);

  // Update imports in all files
  const allFiles = [...frontendFiles, ...backendFiles, ...sharedFiles];
  allFiles.forEach(updateImports);

  console.log(`\nUpdated imports in ${allFiles.length} files.`);
  console.log('\nNext steps:');
  console.log('1. Test the application to ensure everything works correctly');
  console.log('2. Fix any remaining import issues manually');
  console.log('3. Remove the src directory once you\'re confident the migration was successful');
};

// Run the script
main();
