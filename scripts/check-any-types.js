#!/usr/bin/env node

/**
 * This script checks for any 'any' types in TypeScript files
 * and reports them for further investigation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const srcDir = path.join(__dirname, '..', 'src');
const ignorePatterns = ['node_modules', '.next', 'dist', 'build', '__tests__', 'mocks'];

// Find all TypeScript files
const findTsFiles = dir => {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip ignored directories
    if (stat.isDirectory() && !ignorePatterns.includes(file)) {
      results = results.concat(findTsFiles(filePath));
    } else if (
      stat.isFile() &&
      (file.endsWith('.ts') || file.endsWith('.tsx')) &&
      !file.endsWith('.d.ts')
    ) {
      results.push(filePath);
    }
  }

  return results;
};

// Check for 'any' types in a file
const checkFileForAnyTypes = filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const anyTypes = [];

  // Regular expressions to match 'any' types
  const anyTypeRegex = /: any(\[\])?[,;)=|&]/;
  const asAnyRegex = /as any/;
  const anyParamRegex = /\((.*?): any(\[\])?/;
  const genericAnyRegex = /<.*?any.*?>/;

  lines.forEach((line, index) => {
    // Skip comments
    if (
      line.trim().startsWith('//') ||
      line.trim().startsWith('/*') ||
      line.trim().startsWith('*')
    ) {
      return;
    }

    if (
      anyTypeRegex.test(line) ||
      asAnyRegex.test(line) ||
      anyParamRegex.test(line) ||
      genericAnyRegex.test(line)
    ) {
      anyTypes.push({
        line: index + 1,
        content: line.trim(),
      });
    }
  });

  return anyTypes;
};

// Main function
const main = () => {
  console.log("Checking for 'any' types in TypeScript files...");

  const tsFiles = findTsFiles(srcDir);
  let totalAnyTypes = 0;
  const filesWithAnyTypes = [];

  for (const file of tsFiles) {
    const anyTypes = checkFileForAnyTypes(file);

    if (anyTypes.length > 0) {
      const relativePath = path.relative(path.join(__dirname, '..'), file);
      filesWithAnyTypes.push({
        file: relativePath,
        anyTypes,
      });
      totalAnyTypes += anyTypes.length;
    }
  }

  // Sort files by number of 'any' types
  filesWithAnyTypes.sort((a, b) => b.anyTypes.length - a.anyTypes.length);

  // Print results
  console.log(`\nFound ${totalAnyTypes} 'any' types in ${filesWithAnyTypes.length} files:\n`);

  for (const { file, anyTypes } of filesWithAnyTypes) {
    console.log(`${file} (${anyTypes.length} 'any' types):`);

    for (const { line, content } of anyTypes) {
      console.log(`  Line ${line}: ${content}`);
    }

    console.log('');
  }

  if (totalAnyTypes === 0) {
    console.log("No 'any' types found. Great job!");
  } else {
    console.log("Consider replacing these 'any' types with more specific types.");
  }
};

// Run the script
main();
