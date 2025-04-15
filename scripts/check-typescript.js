#!/usr/bin/env node

/**
 * This script checks for TypeScript issues and suggests improvements
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

// Check for missing type annotations
const checkFileForMissingTypes = filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const missingTypes = [];

  // Regular expressions to match missing type annotations
  const functionWithoutReturnType = /function\s+\w+\s*\([^)]*\)\s*{/;
  const arrowFunctionWithoutReturnType = /const\s+\w+\s*=\s*(\([^)]*\)|[^=]*)\s*=>\s*{/;
  const variableWithoutType = /const\s+\w+\s*=\s*[^:;{]/;

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
      functionWithoutReturnType.test(line) ||
      arrowFunctionWithoutReturnType.test(line) ||
      variableWithoutType.test(line)
    ) {
      missingTypes.push({
        line: index + 1,
        content: line.trim(),
      });
    }
  });

  return missingTypes;
};

// Check for TypeScript ignore comments
const checkFileForTsIgnore = filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const tsIgnores = [];

  // Regular expressions to match TypeScript ignore comments
  const tsIgnoreRegex = /@ts-ignore|@ts-nocheck/;

  lines.forEach((line, index) => {
    if (tsIgnoreRegex.test(line)) {
      tsIgnores.push({
        line: index + 1,
        content: line.trim(),
      });
    }
  });

  return tsIgnores;
};

// Main function
const main = () => {
  console.log('Checking for TypeScript issues...');

  const tsFiles = findTsFiles(srcDir);
  let totalAnyTypes = 0;
  let totalMissingTypes = 0;
  let totalTsIgnores = 0;
  const filesWithIssues = [];

  for (const file of tsFiles) {
    const anyTypes = checkFileForAnyTypes(file);
    const missingTypes = checkFileForMissingTypes(file);
    const tsIgnores = checkFileForTsIgnore(file);

    if (anyTypes.length > 0 || missingTypes.length > 0 || tsIgnores.length > 0) {
      const relativePath = path.relative(path.join(__dirname, '..'), file);
      filesWithIssues.push({
        file: relativePath,
        anyTypes,
        missingTypes,
        tsIgnores,
      });
      totalAnyTypes += anyTypes.length;
      totalMissingTypes += missingTypes.length;
      totalTsIgnores += tsIgnores.length;
    }
  }

  // Sort files by total number of issues
  filesWithIssues.sort((a, b) => {
    const aTotal = a.anyTypes.length + a.missingTypes.length + a.tsIgnores.length;
    const bTotal = b.anyTypes.length + b.missingTypes.length + b.tsIgnores.length;
    return bTotal - aTotal;
  });

  // Print results
  console.log(
    `\nFound ${totalAnyTypes + totalMissingTypes + totalTsIgnores} TypeScript issues in ${filesWithIssues.length} files:\n`
  );
  console.log(`- ${totalAnyTypes} 'any' types`);
  console.log(`- ${totalMissingTypes} missing type annotations`);
  console.log(`- ${totalTsIgnores} TypeScript ignore comments\n`);

  for (const { file, anyTypes, missingTypes, tsIgnores } of filesWithIssues) {
    console.log(`${file}:`);

    if (anyTypes.length > 0) {
      console.log(`  'any' types (${anyTypes.length}):`);
      for (const { line, content } of anyTypes) {
        console.log(`    Line ${line}: ${content}`);
      }
    }

    if (missingTypes.length > 0) {
      console.log(`  Missing type annotations (${missingTypes.length}):`);
      for (const { line, content } of missingTypes) {
        console.log(`    Line ${line}: ${content}`);
      }
    }

    if (tsIgnores.length > 0) {
      console.log(`  TypeScript ignore comments (${tsIgnores.length}):`);
      for (const { line, content } of tsIgnores) {
        console.log(`    Line ${line}: ${content}`);
      }
    }

    console.log('');
  }

  if (totalAnyTypes + totalMissingTypes + totalTsIgnores === 0) {
    console.log('No TypeScript issues found. Great job!');
  } else {
    console.log('Consider addressing these TypeScript issues to improve type safety.');
  }
};

// Run the script
main();
