#!/usr/bin/env node

/**
 * This script runs a specific test file or pattern
 * Usage: node scripts/run-test.js [test-file-pattern]
 * Example: node scripts/run-test.js gpxParser
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the test pattern from command line arguments
const testPattern = process.argv[2] || '';

// Find test files matching the pattern
const findTestFiles = (dir, pattern) => {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(findTestFiles(filePath, pattern));
    } else if (
      (file.includes('.test.') || file.includes('.spec.')) &&
      (file.toLowerCase().includes(pattern.toLowerCase()) || pattern === '')
    ) {
      results.push(filePath);
    }
  }

  return results;
};

// Main function
const main = () => {
  try {
    const testsDir = path.join(__dirname, '..', 'src', '__tests__');

    if (!fs.existsSync(testsDir)) {
      console.error('Tests directory not found:', testsDir);
      process.exit(1);
    }

    const testFiles = findTestFiles(testsDir, testPattern);

    if (testFiles.length === 0) {
      console.log(`No test files found matching pattern: ${testPattern}`);
      process.exit(0);
    }

    console.log(`Found ${testFiles.length} test files matching pattern: ${testPattern}`);
    testFiles.forEach(file => console.log(`- ${path.relative(process.cwd(), file)}`));

    // Run the tests
    console.log('\nRunning tests...\n');

    for (const file of testFiles) {
      const relativeFilePath = path.relative(process.cwd(), file);
      console.log(`\n=== Running test: ${relativeFilePath} ===\n`);

      try {
        execSync(`npx jest ${relativeFilePath}`, { stdio: 'inherit' });
        console.log(`\n✅ Test passed: ${relativeFilePath}\n`);
      } catch (error) {
        console.error(`\n❌ Test failed: ${relativeFilePath}\n`);
        process.exit(1);
      }
    }

    console.log('\n✅ All tests passed!\n');
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
};

main();
