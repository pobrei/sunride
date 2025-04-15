#!/usr/bin/env node

/**
 * This script migrates the project from a flat structure to a modular structure
 * with frontend, backend, and shared folders.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const srcDir = path.join(__dirname, '..', 'src');
const frontendDir = path.join(__dirname, '..', 'frontend');
const backendDir = path.join(__dirname, '..', 'backend');
const sharedDir = path.join(__dirname, '..', 'shared');

// Create directories if they don't exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Copy a file from source to destination
const copyFile = (source, destination) => {
  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
  console.log(`Copied: ${source} -> ${destination}`);
};

// Migrate API routes to backend
const migrateApiRoutes = () => {
  const apiDir = path.join(srcDir, 'app', 'api');
  const backendApiDir = path.join(backendDir, 'api');

  if (fs.existsSync(apiDir)) {
    const apiRoutes = fs.readdirSync(apiDir, { withFileTypes: true });

    for (const route of apiRoutes) {
      const sourcePath = path.join(apiDir, route.name);
      const destPath = path.join(backendApiDir, route.name);

      if (route.isDirectory()) {
        // Copy entire directory
        execSync(`cp -r "${sourcePath}" "${destPath}"`);
        console.log(`Copied directory: ${sourcePath} -> ${destPath}`);
      } else {
        copyFile(sourcePath, destPath);
      }
    }
  }
};

// Migrate shared types to shared/types
const migrateSharedTypes = () => {
  const typesDir = path.join(srcDir, 'types');
  const sharedTypesDir = path.join(sharedDir, 'types');

  if (fs.existsSync(typesDir)) {
    const typeFiles = fs.readdirSync(typesDir, { withFileTypes: true });

    for (const file of typeFiles) {
      const sourcePath = path.join(typesDir, file.name);
      const destPath = path.join(sharedTypesDir, file.name);

      if (file.isDirectory()) {
        // Copy entire directory
        execSync(`cp -r "${sourcePath}" "${destPath}"`);
        console.log(`Copied directory: ${sourcePath} -> ${destPath}`);
      } else {
        copyFile(sourcePath, destPath);
      }
    }
  }
};

// Migrate shared utils to shared/utils
const migrateSharedUtils = () => {
  const utilsDir = path.join(srcDir, 'utils');
  const sharedUtilsDir = path.join(sharedDir, 'utils');

  if (fs.existsSync(utilsDir)) {
    const utilFiles = fs.readdirSync(utilsDir, { withFileTypes: true });

    for (const file of utilFiles) {
      const sourcePath = path.join(utilsDir, file.name);
      const destPath = path.join(sharedUtilsDir, file.name);

      if (file.isDirectory()) {
        // Copy entire directory
        execSync(`cp -r "${sourcePath}" "${destPath}"`);
        console.log(`Copied directory: ${sourcePath} -> ${destPath}`);
      } else {
        copyFile(sourcePath, destPath);
      }
    }
  }
};

// Migrate lib files to backend/lib or shared/lib based on their content
const migrateLibFiles = () => {
  const libDir = path.join(srcDir, 'lib');
  const backendLibDir = path.join(backendDir, 'lib');
  const sharedLibDir = path.join(sharedDir, 'lib');

  // Create lib directories
  ensureDir(backendLibDir);
  ensureDir(sharedLibDir);

  if (fs.existsSync(libDir)) {
    const libFiles = fs.readdirSync(libDir, { withFileTypes: true });

    for (const file of libFiles) {
      const sourcePath = path.join(libDir, file.name);

      // Determine if the file is backend-specific or shared
      let isBackendSpecific = false;

      if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
        const content = fs.readFileSync(sourcePath, 'utf8');

        // Check if file contains backend-specific imports or code
        isBackendSpecific =
          content.includes('import { NextRequest') ||
          content.includes('import { NextResponse') ||
          content.includes('mongodb') ||
          content.includes('fetch(') ||
          file.name === 'mongodb.ts' ||
          file.name === 'weatherAPI.ts' ||
          file.name === 'rateLimiter.ts';
      }

      const destPath = path.join(
        isBackendSpecific ? backendLibDir : sharedLibDir,
        file.name
      );

      if (file.isDirectory()) {
        // Create destination directory first
        ensureDir(destPath);
        // Copy entire directory contents
        const dirContents = fs.readdirSync(sourcePath, { withFileTypes: true });
        for (const item of dirContents) {
          const itemSourcePath = path.join(sourcePath, item.name);
          const itemDestPath = path.join(destPath, item.name);
          if (item.isDirectory()) {
            execSync(`cp -r "${itemSourcePath}" "${itemDestPath}"`);
            console.log(`Copied directory: ${itemSourcePath} -> ${itemDestPath}`);
          } else {
            copyFile(itemSourcePath, itemDestPath);
          }
        }
      } else {
        copyFile(sourcePath, destPath);
      }
    }
  }
};

// Migrate app folder to frontend/app
const migrateAppFolder = () => {
  const appDir = path.join(srcDir, 'app');
  const frontendAppDir = path.join(frontendDir, 'app');

  if (fs.existsSync(appDir)) {
    // Copy everything except the api folder
    const appFiles = fs.readdirSync(appDir, { withFileTypes: true });

    for (const file of appFiles) {
      if (file.name !== 'api') {
        const sourcePath = path.join(appDir, file.name);
        const destPath = path.join(frontendAppDir, file.name);

        if (file.isDirectory()) {
          // Copy entire directory
          execSync(`cp -r "${sourcePath}" "${destPath}"`);
          console.log(`Copied directory: ${sourcePath} -> ${destPath}`);
        } else {
          copyFile(sourcePath, destPath);
        }
      }
    }
  }
};

// Migrate components to frontend/components
const migrateComponents = () => {
  const componentsDir = path.join(srcDir, 'components');
  const frontendComponentsDir = path.join(frontendDir, 'components');

  if (fs.existsSync(componentsDir)) {
    execSync(`cp -r "${componentsDir}" "${frontendComponentsDir}"`);
    console.log(`Copied directory: ${componentsDir} -> ${frontendComponentsDir}`);
  }
};

// Migrate features to frontend/features
const migrateFeatures = () => {
  const featuresDir = path.join(srcDir, 'features');
  const frontendFeaturesDir = path.join(frontendDir, 'features');

  if (fs.existsSync(featuresDir)) {
    execSync(`cp -r "${featuresDir}" "${frontendFeaturesDir}"`);
    console.log(`Copied directory: ${featuresDir} -> ${frontendFeaturesDir}`);
  }
};

// Migrate hooks to frontend/hooks
const migrateHooks = () => {
  const hooksDir = path.join(srcDir, 'hooks');
  const frontendHooksDir = path.join(frontendDir, 'hooks');

  if (fs.existsSync(hooksDir)) {
    execSync(`cp -r "${hooksDir}" "${frontendHooksDir}"`);
    console.log(`Copied directory: ${hooksDir} -> ${frontendHooksDir}`);
  }
};

// Migrate test files
const migrateTestFiles = () => {
  const testsDir = path.join(srcDir, '__tests__');
  const frontendTestsDir = path.join(frontendDir, '__tests__');
  const backendTestsDir = path.join(backendDir, '__tests__');
  const sharedTestsDir = path.join(sharedDir, '__tests__');

  if (fs.existsSync(testsDir)) {
    // Create test directories
    ensureDir(frontendTestsDir);
    ensureDir(backendTestsDir);
    ensureDir(sharedTestsDir);

    const testFiles = fs.readdirSync(testsDir, { withFileTypes: true });

    for (const file of testFiles) {
      const sourcePath = path.join(testsDir, file.name);

      // Determine which directory to put the test in
      let destDir;
      if (file.name.startsWith('components') ||
          file.name.startsWith('features') ||
          file.name.startsWith('Map.test') ||
          file.name.startsWith('WeatherContext.test')) {
        destDir = frontendTestsDir;
      } else if (file.name.startsWith('api') ||
                file.name.startsWith('server')) {
        destDir = backendTestsDir;
      } else {
        destDir = sharedTestsDir;
      }

      const destPath = path.join(destDir, file.name);

      if (file.isDirectory()) {
        // Create destination directory first
        ensureDir(destPath);
        // Copy entire directory contents
        const dirContents = fs.readdirSync(sourcePath, { withFileTypes: true });
        for (const item of dirContents) {
          const itemSourcePath = path.join(sourcePath, item.name);
          const itemDestPath = path.join(destPath, item.name);
          if (item.isDirectory()) {
            execSync(`cp -r "${itemSourcePath}" "${itemDestPath}"`);
            console.log(`Copied directory: ${itemSourcePath} -> ${itemDestPath}`);
          } else {
            copyFile(itemSourcePath, itemDestPath);
          }
        }
      } else {
        copyFile(sourcePath, destPath);
      }
    }
  }
};

// Migrate styles
const migrateStyles = () => {
  const stylesDir = path.join(srcDir, 'styles');
  const sharedStylesDir = path.join(sharedDir, 'styles');

  if (fs.existsSync(stylesDir)) {
    ensureDir(sharedStylesDir);
    execSync(`cp -r "${stylesDir}"/* "${sharedStylesDir}"`);
    console.log(`Copied directory: ${stylesDir} -> ${sharedStylesDir}`);
  }
};

// Migrate context
const migrateContext = () => {
  const contextDir = path.join(srcDir, 'context');
  const frontendContextDir = path.join(frontendDir, 'context');

  if (fs.existsSync(contextDir)) {
    ensureDir(frontendContextDir);
    execSync(`cp -r "${contextDir}"/* "${frontendContextDir}"`);
    console.log(`Copied directory: ${contextDir} -> ${frontendContextDir}`);
  }
};

// Migrate workers
const migrateWorkers = () => {
  const workersDir = path.join(srcDir, 'workers');
  const sharedWorkersDir = path.join(sharedDir, 'workers');

  if (fs.existsSync(workersDir)) {
    ensureDir(sharedWorkersDir);
    execSync(`cp -r "${workersDir}"/* "${sharedWorkersDir}"`);
    console.log(`Copied directory: ${workersDir} -> ${sharedWorkersDir}`);
  }
};

// Migrate middleware
const migrateMiddleware = () => {
  const middlewarePath = path.join(srcDir, 'middleware.ts');
  const backendMiddlewarePath = path.join(backendDir, 'middleware.ts');

  if (fs.existsSync(middlewarePath)) {
    copyFile(middlewarePath, backendMiddlewarePath);
  }
};

// Main function
const main = () => {
  console.log('Starting migration to modular structure...');

  // Create main directories
  ensureDir(frontendDir);
  ensureDir(backendDir);
  ensureDir(sharedDir);

  // Migrate files
  migrateApiRoutes();
  migrateSharedTypes();
  migrateSharedUtils();
  migrateLibFiles();
  migrateAppFolder();
  migrateComponents();
  migrateFeatures();
  migrateHooks();
  migrateTestFiles();
  migrateStyles();
  migrateContext();
  migrateWorkers();
  migrateMiddleware();

  console.log('\nMigration completed!');
  console.log('\nNext steps:');
  console.log('1. Update imports in the migrated files to use the new path aliases');
  console.log('2. Test the application to ensure everything works correctly');
  console.log('3. Remove the src directory once you\'re confident the migration was successful');
};

// Run the script
main();
