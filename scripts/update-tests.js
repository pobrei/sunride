#!/usr/bin/env node

/**
 * This script updates test files to work with the new modular structure.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const frontendDir = path.join(__dirname, '..', 'frontend');
const backendDir = path.join(__dirname, '..', 'backend');
const sharedDir = path.join(__dirname, '..', 'shared');
const srcDir = path.join(__dirname, '..', 'src');

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

// Function to update imports in a test file
const updateTestFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Update imports from @/ to the appropriate new path
  const oldImportRegex = /from\s+['"]@\/([^'"]+)['"]/g;
  let updatedContent = content.replace(oldImportRegex, (match, importPath) => {
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
    }
    
    // If we can't determine the new path, keep the original import
    return match;
  });
  
  // Update jest.mock statements
  const mockRegex = /jest\.mock\(['"]@\/([^'"]+)['"]/g;
  updatedContent = updatedContent.replace(mockRegex, (match, importPath) => {
    updated = true;
    
    // Determine the appropriate new path alias based on the import path
    if (importPath.startsWith('components/') || 
        importPath.startsWith('app/') || 
        importPath.startsWith('features/') || 
        importPath.startsWith('hooks/') ||
        importPath.startsWith('context/')) {
      return `jest.mock('@frontend/${importPath}'`;
    } else if (importPath.startsWith('api/') || 
               importPath.startsWith('lib/mongodb') || 
               importPath.startsWith('lib/weatherAPI') || 
               importPath.startsWith('lib/rateLimiter')) {
      return `jest.mock('@backend/${importPath}'`;
    } else if (importPath.startsWith('types/') || 
               importPath.startsWith('utils/') || 
               importPath.startsWith('styles/') ||
               importPath.startsWith('workers/') ||
               importPath.startsWith('lib/utils') || 
               importPath.startsWith('lib/sentry') ||
               importPath.startsWith('lib/gpx')) {
      return `jest.mock('@shared/${importPath}'`;
    } else if (importPath.startsWith('lib/')) {
      // For other lib imports, check if they should be backend or shared
      if (fs.existsSync(path.join(backendDir, 'lib', importPath.substring(4)))) {
        return `jest.mock('@backend/${importPath}'`;
      } else {
        return `jest.mock('@shared/${importPath}'`;
      }
    }
    
    // If we can't determine the new path, keep the original import
    return match;
  });
  
  // Update relative imports
  const relativeImportRegex = /from\s+['"]\.\.\/\.\.\/([^'"]+)['"]/g;
  updatedContent = updatedContent.replace(relativeImportRegex, (match, importPath) => {
    // Only update if the file is in a test directory
    if (filePath.includes('__tests__')) {
      updated = true;
      
      // Determine which module the import is likely from
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
      }
    }
    
    // If we can't determine the new path, keep the original import
    return match;
  });
  
  if (updated) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated test file: ${filePath}`);
  }
};

// Function to update jest.config.js
const updateJestConfig = () => {
  const jestConfigPath = path.join(__dirname, '..', 'jest.config.js');
  
  if (fs.existsSync(jestConfigPath)) {
    let content = fs.readFileSync(jestConfigPath, 'utf8');
    
    // Update moduleNameMapper
    const moduleNameMapperRegex = /moduleNameMapper:\s*{([^}]*)}/gs;
    const updatedContent = content.replace(moduleNameMapperRegex, (match, mapperContent) => {
      // Check if we already updated the config
      if (mapperContent.includes('@frontend/')) {
        return match;
      }
      
      // Add new mappers
      return `moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@frontend/(.*)$': '<rootDir>/frontend/$1',
    '^@backend/(.*)$': '<rootDir>/backend/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  }`;
    });
    
    // Update collectCoverageFrom
    const coverageRegex = /collectCoverageFrom:\s*\[([^\]]*)\]/gs;
    const updatedCoverage = updatedContent.replace(coverageRegex, (match, coverageContent) => {
      // Check if we already updated the config
      if (coverageContent.includes('frontend/')) {
        return match;
      }
      
      // Add new coverage paths
      return `collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'frontend/**/*.{js,jsx,ts,tsx}',
    'backend/**/*.{js,jsx,ts,tsx}',
    'shared/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/_*.{js,jsx,ts,tsx}',
    '!**/index.{js,jsx,ts,tsx}',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/pages/_app.tsx',
    '!**/pages/_document.tsx',
    '!**/node_modules/**',
  ]`;
    });
    
    // Update testPathIgnorePatterns
    const ignoreRegex = /testPathIgnorePatterns:\s*\[([^\]]*)\]/gs;
    const updatedIgnore = updatedCoverage.replace(ignoreRegex, (match, ignoreContent) => {
      // Check if we already updated the config
      if (ignoreContent.includes('frontend/')) {
        return match;
      }
      
      // Add new ignore paths
      return `testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/out/',
    '/coverage/',
    '/public/',
    '/scripts/',
  ]`;
    });
    
    fs.writeFileSync(jestConfigPath, updatedIgnore);
    console.log('Updated jest.config.js');
  }
};

// Function to update test setup files
const updateTestSetup = () => {
  const setupDir = path.join(srcDir, '__tests__', 'setup');
  const newSetupDir = path.join(sharedDir, '__tests__', 'setup');
  
  if (fs.existsSync(setupDir)) {
    // Create the new setup directory
    if (!fs.existsSync(newSetupDir)) {
      fs.mkdirSync(newSetupDir, { recursive: true });
    }
    
    // Copy setup files
    const setupFiles = fs.readdirSync(setupDir);
    
    for (const file of setupFiles) {
      const sourcePath = path.join(setupDir, file);
      const destPath = path.join(newSetupDir, file);
      
      if (fs.statSync(sourcePath).isFile()) {
        // Read the file content
        let content = fs.readFileSync(sourcePath, 'utf8');
        
        // Update imports
        const oldImportRegex = /from\s+['"]@\/([^'"]+)['"]/g;
        const updatedContent = content.replace(oldImportRegex, (match, importPath) => {
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
          }
          
          // If we can't determine the new path, keep the original import
          return match;
        });
        
        // Write the updated content to the new location
        fs.writeFileSync(destPath, updatedContent);
        console.log(`Copied and updated setup file: ${destPath}`);
      }
    }
  }
};

// Function to update test utils
const updateTestUtils = () => {
  const utilsDir = path.join(srcDir, '__tests__', 'utils');
  const newUtilsDir = path.join(sharedDir, '__tests__', 'utils');
  
  if (fs.existsSync(utilsDir)) {
    // Create the new utils directory
    if (!fs.existsSync(newUtilsDir)) {
      fs.mkdirSync(newUtilsDir, { recursive: true });
    }
    
    // Copy utils files
    const utilsFiles = fs.readdirSync(utilsDir);
    
    for (const file of utilsFiles) {
      const sourcePath = path.join(utilsDir, file);
      const destPath = path.join(newUtilsDir, file);
      
      if (fs.statSync(sourcePath).isFile()) {
        // Read the file content
        let content = fs.readFileSync(sourcePath, 'utf8');
        
        // Update imports
        const oldImportRegex = /from\s+['"]@\/([^'"]+)['"]/g;
        const updatedContent = content.replace(oldImportRegex, (match, importPath) => {
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
          }
          
          // If we can't determine the new path, keep the original import
          return match;
        });
        
        // Write the updated content to the new location
        fs.writeFileSync(destPath, updatedContent);
        console.log(`Copied and updated test util: ${destPath}`);
      }
    }
  }
};

// Main function
const main = () => {
  console.log('Updating tests for the new modular structure...');
  
  // Update jest.config.js
  updateJestConfig();
  
  // Update test setup files
  updateTestSetup();
  
  // Update test utils
  updateTestUtils();
  
  // Find all test files in the project
  const frontendTestFiles = findFiles(path.join(frontendDir, '__tests__'), fileExtensions);
  const backendTestFiles = findFiles(path.join(backendDir, '__tests__'), fileExtensions);
  const sharedTestFiles = findFiles(path.join(sharedDir, '__tests__'), fileExtensions);
  const srcTestFiles = findFiles(path.join(srcDir, '__tests__'), fileExtensions);
  
  // Update imports in all test files
  const allTestFiles = [...frontendTestFiles, ...backendTestFiles, ...sharedTestFiles, ...srcTestFiles];
  allTestFiles.forEach(updateTestFile);
  
  console.log(`\nUpdated ${allTestFiles.length} test files.`);
  console.log('\nNext steps:');
  console.log('1. Run the tests to see if there are any remaining issues');
  console.log('2. Fix any remaining import issues manually');
  console.log('3. Remove the src directory once you\'re confident the migration was successful');
};

// Run the script
main();
